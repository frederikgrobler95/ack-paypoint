import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";

export const processRefund = https.onCall({ region: "africa-south1" }, async (request) => {
  const { accountId, amountCents, refundOfTxnId, idempotencyKey, operatorName } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new https.HttpsError("unauthenticated", "User is not authenticated.");
  }

  if (!accountId || !amountCents || !refundOfTxnId || !idempotencyKey) {
    throw new https.HttpsError("invalid-argument", "Missing required parameters.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      const idemDocRef = db.collection("_idem").doc(idempotencyKey);
      const idemDoc = await transaction.get(idemDocRef);

      if (idemDoc.exists) {
        return { status: "already-processed" };
      }

      const accountDocRef = db.collection("accounts").doc(accountId);
      const accountDoc = await transaction.get(accountDocRef);
      if (!accountDoc.exists) {
        throw new https.HttpsError("not-found", `Account ${accountId} not found.`);
      }
      const accountData = accountDoc.data();
      if (!accountData) {
        throw new https.HttpsError("internal", `Account ${accountId} data is missing.`);
      }

      const originalTxnDocRef = db.collection("transactions").doc(refundOfTxnId);
      const originalTxnDoc = await transaction.get(originalTxnDocRef);
      if (!originalTxnDoc.exists) {
        throw new https.HttpsError("not-found", `Original transaction ${refundOfTxnId} not found.`);
      }
      const originalTxnData = originalTxnDoc.data();
      if (!originalTxnData) {
        throw new https.HttpsError("internal", `Original transaction ${refundOfTxnId} data is missing.`);
      }

      if (originalTxnData.accountId !== accountId) {
        throw new https.HttpsError("failed-precondition", "Transaction does not belong to this account.");
      }
      if (originalTxnData.type !== "debit") {
        throw new https.HttpsError("failed-precondition", "Can only refund debit transactions.");
      }

      const assignmentDocRef = db.collection("assignments").doc(uid);
      const assignmentDoc = await transaction.get(assignmentDocRef);
      if (!assignmentDoc.exists) {
        throw new https.HttpsError("failed-precondition", `User ${uid} is not assigned to a stall.`);
      }
      const stallId = assignmentDoc.data()?.stallId;

      if (originalTxnData.stallId !== stallId) {
        throw new https.HttpsError("failed-precondition", "Cannot refund transactions from a different stall.");
      }

      const refundsQuery = db.collection("transactions").where("refundOfTxnId", "==", refundOfTxnId);
      const refundsSnapshot = await transaction.get(refundsQuery);
      const totalRefundedCents = refundsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amountCents, 0);

      const remainingRefundableCents = originalTxnData.amountCents - totalRefundedCents;
      if (amountCents > remainingRefundableCents) {
        throw new https.HttpsError("failed-precondition", `Refund amount exceeds remaining balance. Maximum refund: ${remainingRefundableCents / 100}`);
      }

      const refundData = {
        accountId,
        stallId,
        operatorId: uid,
        operatorName: operatorName || "Unknown Operator",
        amountCents,
        type: "refund",
        refundOfTxnId,
        idempotencyKey,
        createdAt: FieldValue.serverTimestamp(),
      };

      const refundDocRef = db.collection("transactions").doc();
      transaction.set(refundDocRef, refundData);

      const newBalanceCents = accountData.balanceCents - amountCents;
      transaction.update(accountDocRef, {
        balanceCents: newBalanceCents,
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(idemDocRef, { createdAt: FieldValue.serverTimestamp() });

      return { status: "success", refundId: refundDocRef.id };
    });

    return result;
  } catch (error: any) {
    logger.error("Error processing refund", {
      error: error.message,
      code: error.code || 'unknown',
      stack: error.stack,
      accountId,
      refundOfTxnId,
      uid,
      timestamp: new Date().toISOString()
    });
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError("internal", "An internal error occurred while processing the refund.");
  }
});