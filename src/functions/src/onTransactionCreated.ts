import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";

// Local interfaces to replace shared contracts
type TransactionType = 'sale' | 'refund';

interface Transaction {
  id: string;
  stallId: string;
  stallName?: string;
  operatorId: string;
  operatorName: string;
  customerId: string;
  customerName?: string;
  amountCents: number;
  type: TransactionType;
  refundOfTxnId?: string;
  idempotencyKey: string;
  createdAt: FieldValue;
}

type StallType = 'registration' | 'checkout' | 'commerce';

interface Stall {
  id: string;
  name: string;
  type: StallType;
  totalAmount: number; // Optional fixed amount for registration stalls
}

export const onTransactionCreated = onDocumentCreated(
  { document: "transactions/{transactionId}", region: "africa-south1" },
  async (event) => {
    const transaction = event.data?.data() as Transaction;
    if (!transaction) {
      console.error("No transaction data found in event");
      return;
    }

    try {
      const stallRef = db.collection("stalls").doc(transaction.stallId);
      const stallDoc = await stallRef.get();

      if (!stallDoc.exists) {
        console.error("Stall not found with ID:", transaction.stallId);
        return;
      }

      const stall = stallDoc.data() as Stall;

      await db.runTransaction(async (firestoreTransaction) => {
        // Determine the amount to add/subtract based on transaction type
        const amountToAdd = transaction.type === 'sale'
          ? transaction.amountCents
          : -transaction.amountCents;

        const updatedTotalAmount = (stall.totalAmount || 0) + amountToAdd;
        firestoreTransaction.update(stallRef, {
          totalAmount: updatedTotalAmount,
        });

        const statsRef = db.collection("stats").doc("live");
        firestoreTransaction.set(
          statsRef,
          {
            totalSales: FieldValue.increment(amountToAdd),
          },
          { merge: true }
        );
      });

      console.log("Successfully updated stall and stats for transaction");
    } catch (error) {
      console.error("Error processing transaction creation:", error);
    }
  }
);