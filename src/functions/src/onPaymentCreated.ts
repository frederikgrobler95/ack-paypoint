import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db } from "./firebase";
import { FieldValue } from "firebase-admin/firestore";

// Local interfaces to replace shared contracts
type PaymentMethod = 'card' | 'cash' | 'eft';

interface Payment {
  id: string;
  method: PaymentMethod;
  amountCents: number;
  operatorId: string;
  operatorName?: string;
  customerId: string;
  customerName?: string;
  stallId: string;
  idempotencyKey: string;
  createdAt: Date;
}

type StallType = 'registration' | 'checkout' | 'commerce';

interface Stall {
  id: string;
  name: string;
  type: StallType;
  totalAmount: number; // Optional fixed amount for registration stalls
}

// When a payment is created, update the stall's totalAmount. Seeing as a payment can only be created in a checkout stall, we only need to handle that case.
// Also update the "stats" collection's live document to add the amount to the total revenue.
export const onPaymentCreated = onDocumentCreated({ document: "payments/{paymentId}", region: "africa-south1" }, async (event) => {
    // Get the newly created payment
    const payment = event.data?.data() as Payment;
    if (!payment) {
      console.error("No payment data found in event");
      return;
    }

    try {
      // Get the stall associated with this payment
      const stallRef = db.collection("stalls").doc(payment.stallId);
      const stallDoc = await stallRef.get();
      
      if (!stallDoc.exists) {
        console.error("Stall not found with ID:", payment.stallId);
        return;
      }
      
      const stall = stallDoc.data() as Stall;
      
      // Only handle checkout stalls
      if (stall.type !== "checkout") {
        console.log("Payment created for non-checkout stall, skipping stall totalAmount update");
        // We still need to update the stats collection
        await db.runTransaction(async (transaction) => {
          // Update the stats collection's live document to add to total revenue
          const statsRef = db.collection("stats").doc("live");
          transaction.set(statsRef, {
            totalRevenue: FieldValue.increment(payment.amountCents)
          }, { merge: true });
        });
        return;
      }
      
      // Use a transaction to ensure atomicity
      await db.runTransaction(async (transaction) => {
        // Update the stall's totalAmount (add the payment amount)
        const updatedTotalAmount = (stall.totalAmount || 0) + payment.amountCents;
        transaction.update(stallRef, { totalAmount: updatedTotalAmount });
        
        // Update the stats collection's live document to add to total revenue
        const statsRef = db.collection("stats").doc("live");
        transaction.set(statsRef, {
          totalRevenue: FieldValue.increment(payment.amountCents)
        }, { merge: true });
      });
      
      console.log("Successfully updated stall and stats for payment");
    } catch (error) {
      console.error("Error processing payment creation:", error);
    }
  }
);