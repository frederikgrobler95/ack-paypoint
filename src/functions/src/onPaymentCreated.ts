import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";
import * as logger from "firebase-functions/logger";

const statsDocRef = db.doc('stats/live');

export const onPaymentCreated = onDocumentCreated(
  { document: 'payments/{paymentId}', region: 'africa-south1' },
  (event) => {
    const snap = event.data;
    if (!snap) {
      logger.error('No data associated with the event', { event });
      return null;
    }
    const payment = snap.data();
    const amount = payment.amountCents;

    return statsDocRef.set(
      {
        totalCheckoutAmount: FieldValue.increment(amount),
        lastUpdated: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);