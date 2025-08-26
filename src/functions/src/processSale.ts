import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";

export const processSale = https.onCall({ region: "africa-south1" }, async (request) => {
  const { qrCodeId, amountCents, idempotencyKey, stallId, operatorName } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new https.HttpsError("unauthenticated", "User is not authenticated.");
  }

  // Basic validation
  if (!qrCodeId || !amountCents || !idempotencyKey || !stallId) {
    throw new https.HttpsError("invalid-argument", "Missing required parameters.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const idemDocRef = db.collection("_idem").doc(idempotencyKey);
      const idemDoc = await transaction.get(idemDocRef);

      if (idemDoc.exists) {
        logger.info("Idempotent request already processed", { idempotencyKey });
        return { status: "already-processed" };
      }

      // Find customer by QR code
      const customersQuery = db.collection("customers").where("qrCodeId", "==", qrCodeId).limit(1);
      const customersSnapshot = await transaction.get(customersQuery);

      if (customersSnapshot.empty) {
        throw new https.HttpsError("not-found", `No customer found for QR code ${qrCodeId}.`);
      }

      const customerDoc = customersSnapshot.docs[0];
      const customerId = customerDoc.id;
      const customerData = customerDoc.data();

      if (!customerData || customerData.qrCodeId !== qrCodeId) {
        throw new https.HttpsError("not-found", `Customer data is invalid for QR code ${qrCodeId}.`);
      }

      // Validate operator's assignment
      const assignmentDocRef = db.collection("assignments").doc(uid);
      const assignmentDoc = await transaction.get(assignmentDocRef);

      if (!assignmentDoc.exists) {
        throw new https.HttpsError("failed-precondition", `User ${uid} is not assigned to any stall.`);
      }

      const assignmentData = assignmentDoc.data();
      if (assignmentData?.stallId !== stallId) {
        throw new https.HttpsError("failed-precondition", `User is assigned to stall ${assignmentData?.stallId}, not ${stallId}.`);
      }

      // Find account
      const accountsQuery = db.collection("accounts")
        .where("customerId", "==", customerId)
        .limit(1);
      const accountsSnapshot = await transaction.get(accountsQuery);

      if (accountsSnapshot.empty) {
        throw new https.HttpsError("not-found", `No account found for customer ${customerId}.`);
      }

      const accountDoc = accountsSnapshot.docs[0];
      const accountData = accountDoc.data();

      if (!accountData) {
        throw new https.HttpsError("internal", "Account data is missing.");
      }

      // Create transaction
      const transactionData = {
        accountId: accountDoc.id,
        stallId,
        operatorId: uid,
        operatorName: operatorName || "Unknown Operator",
        amountCents,
        type: "debit",
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      };

      const transactionDocRef = db.collection("transactions").doc();
      transaction.set(transactionDocRef, transactionData);

      // Update account balance
      const newBalanceCents = (accountData.balanceCents || 0) + amountCents;
      const accountUpdates = {
        balanceCents: newBalanceCents,
        status: "unpaid",
        updatedAt: FieldValue.serverTimestamp(),
      };
      transaction.update(accountDoc.ref, accountUpdates);

      // Mark idempotency
      transaction.set(idemDocRef, { 
        createdAt: FieldValue.serverTimestamp(),
        originalTransactionId: transactionDocRef.id 
      });

      return {
        status: "success",
        transactionId: transactionDocRef.id,
        customerId,
        accountId: accountDoc.id,
        newBalance: newBalanceCents,
      };
    });

    return result;
  } catch (error: any) {
    logger.error("Error processing sale", {
      error: error.message,
      code: error.code || 'unknown',
      stack: error.stack,
      qrCodeId,
      stallId,
      uid,
      timestamp: new Date().toISOString()
    });

    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError("internal", "An internal error occurred while processing the sale.");
  }
});