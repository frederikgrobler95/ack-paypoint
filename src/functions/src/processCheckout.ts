import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";

export const processCheckout = https.onCall({ region: "africa-south1" }, async (request) => {
  const { qrCodeId, paymentMethod, amountCents, idempotencyKey, operatorName } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new https.HttpsError("unauthenticated", "User is not authenticated.");
  }

  if (!qrCodeId || !paymentMethod || !amountCents || !idempotencyKey) {
    throw new https.HttpsError("invalid-argument", "Missing required parameters.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const idemDocRef = db.collection("_idem").doc(idempotencyKey);
      const idemDoc = await transaction.get(idemDocRef);

      if (idemDoc.exists) {
        return { status: "already-processed" };
      }

      const qrCodesQuery = db.collection("qrCodes").where("label", "==", qrCodeId).limit(1);
      const qrCodesSnapshot = await transaction.get(qrCodesQuery);
      if (qrCodesSnapshot.empty) {
        throw new https.HttpsError("not-found", `QR code ${qrCodeId} not found.`);
      }

      const customersQuery = db.collection("customers").where("qrCodeId", "==", qrCodeId).limit(1);
      const customersSnapshot = await transaction.get(customersQuery);
      if (customersSnapshot.empty) {
        throw new https.HttpsError("not-found", `No customer found for QR code ${qrCodeId}.`);
      }
      const customerId = customersSnapshot.docs[0].id;

      const accountsQuery = db.collection("accounts").where("customerId", "==", customerId).limit(1);
      const accountsSnapshot = await transaction.get(accountsQuery);
      if (accountsSnapshot.empty) {
        throw new https.HttpsError("not-found", `No account found for customer ${customerId}.`);
      }
      const accountDoc = accountsSnapshot.docs[0];
      const accountData = accountDoc.data();

      if (!accountData) {
        throw new https.HttpsError("internal", `Account ${accountDoc.id} data is missing.`);
      }

      if (accountData.status === "paid") {
        throw new https.HttpsError("failed-precondition", "Account is already paid.");
      }
      if (accountData.balanceCents !== amountCents) {
        throw new https.HttpsError("failed-precondition", `Amount ${amountCents} does not match account balance ${accountData.balanceCents}.`);
      }

      const assignmentDocRef = db.collection("assignments").doc(uid);
      const assignmentDoc = await transaction.get(assignmentDocRef);
      if (!assignmentDoc.exists) {
        throw new https.HttpsError("failed-precondition", `User ${uid} is not assigned to a stall.`);
      }
      const stallId = assignmentDoc.data()?.stallId;

      const paymentData = {
        accountId: accountDoc.id,
        method: paymentMethod,
        amountCents,
        operatorId: uid,
        operatorName: operatorName || "Unknown Operator",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      };
      const paymentDocRef = db.collection("payments").doc();
      transaction.set(paymentDocRef, paymentData);

      transaction.update(accountDoc.ref, {
        status: "paid",
        balanceCents: 0,
        lastPaidAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const creditTransactionData = {
        accountId: accountDoc.id,
        stallId,
        operatorId: uid,
        operatorName: operatorName || "Unknown Operator",
        amountCents,
        type: "credit",
        idempotencyKey: `txn-${idempotencyKey}`,
        createdAt: FieldValue.serverTimestamp(),
      };
      const transactionDocRef = db.collection("transactions").doc();
      transaction.set(transactionDocRef, creditTransactionData);

      transaction.set(idemDocRef, { createdAt: FieldValue.serverTimestamp() });

      return { status: "success", paymentId: paymentDocRef.id };
    });

    return result;
  } catch (error: any) {
    logger.error("Error processing checkout", {
      error: error.message,
      code: error.code || 'unknown',
      stack: error.stack,
      qrCodeId,
      paymentMethod,
      uid,
      timestamp: new Date().toISOString()
    });
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError("internal", "An internal error occurred while processing the checkout.");
  }
});