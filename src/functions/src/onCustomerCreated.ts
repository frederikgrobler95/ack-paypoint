import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";
import * as logger from "firebase-functions/logger";

const statsDocRef = db.doc('stats/live');

export const onCustomerCreated = onDocumentCreated(
  { document: 'customers/{customerId}', region: 'africa-south1' },
  (event) => {
    const snap = event.data;
    if (!snap) {
      logger.error('No data associated with the event', { event });
      return null;
    }
    return statsDocRef.set(
      { totalCustomers: FieldValue.increment(1) },
      { merge: true }
    );
  }
);