import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";
import * as logger from "firebase-functions/logger";

const statsDocRef = db.doc('stats/live');

export const onTransactionCreated = onDocumentCreated(
  { document: 'transactions/{transactionId}', region: 'africa-south1' },
  (event) => {
    const snap = event.data;
    if (!snap) {
      logger.error('No data associated with the event', { event });
      return null;
    }
    const transaction = snap.data();

    // Only process debit and refund transactions for sales stats
    if (transaction.type !== 'debit' && transaction.type !== 'refund') {
      return null;
    }

    const amount =
      transaction.type === 'refund'
        ? -transaction.amountCents
        : transaction.amountCents;

    return statsDocRef.set(
      {
        totalSales: FieldValue.increment(amount),
        lastUpdated: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);