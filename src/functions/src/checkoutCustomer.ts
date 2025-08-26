import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase";
import { FieldValue, collection, doc } from "firebase-admin/firestore";

// Input type for the checkout function
interface CheckoutInput {
  method: string;
  amountCents: number;
  operatorId: string;
  customerId: string;
  idempotencyKey: string;
  operatorName?: string;
  customerName?: string;
}

// Output type for the checkout function
interface CheckoutOutput {
  paymentId: string;
  customerId: string;
  amountCents: number;
  method: string;
  createdAt: Date;
}

export const checkoutCustomer = onCall(
  { region: "africa-south1" },
  async (request: any): Promise<CheckoutOutput> => {
    // Authenticate the user
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError(
        "unauthenticated",
        "User is not authenticated."
      );
    }

    // Validate input
    const data = request.data as CheckoutInput;
    if (!data.method || !data.amountCents || !data.operatorId || !data.customerId || !data.idempotencyKey) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: method, amountCents, operatorId, customerId, idempotencyKey"
      );
    }

    logger.info("Checkout customer request", { data });

    try {
      // Check if a payment with the same idempotencyKey already exists
      const existingPaymentQuery = db
        .collection("payments")
        .where("idempotencyKey", "==", data.idempotencyKey)
        .limit(1);
      
      const existingPaymentSnapshot = await existingPaymentQuery.get();
      
      if (!existingPaymentSnapshot.empty) {
        // If it exists, return the existing payment document
        const existingPayment = existingPaymentSnapshot.docs[0];
        const paymentData = existingPayment.data();
        
        logger.info("Payment already exists", { paymentId: existingPayment.id });
        
        return {
          paymentId: existingPayment.id,
          customerId: paymentData.customerId,
          amountCents: paymentData.amountCents,
          method: paymentData.method,
          createdAt: paymentData.createdAt.toDate(),
        };
      }

      // Start a transaction to ensure atomicity
      const result = await db.runTransaction(async (transaction: any) => {
        // Create a new payment document
        const paymentDocRef = db.collection("payments").doc();
        
        const paymentData = {
          method: data.method,
          amountCents: data.amountCents,
          operatorId: data.operatorId,
          operatorName: data.operatorName,
          customerId: data.customerId,
          customerName: data.customerName,
          idempotencyKey: data.idempotencyKey,
          createdAt: FieldValue.serverTimestamp(),
        };
        
        transaction.set(paymentDocRef, paymentData);
        
        // Update the customer's balanceCents and set their status to paid
        const customerDocRef = db.collection("customers").doc(data.customerId);
        const customerDoc = await transaction.get(customerDocRef);
        
        if (!customerDoc.exists) {
          throw new HttpsError(
            "not-found",
            "Customer not found"
          );
        }
        
        const customerData = customerDoc.data();
        const currentBalance = customerData?.Account?.balanceCents || 0;
        const newBalance = currentBalance - data.amountCents;
        
        transaction.update(customerDocRef, {
          "Account.balanceCents": newBalance,
          "Account.status": "paid",
          "Account.lastPaidAt": FieldValue.serverTimestamp(),
        });
        
        return {
          paymentId: paymentDocRef.id,
          customerId: data.customerId,
          amountCents: data.amountCents,
          method: data.method,
          createdAt: new Date(),
        };
      });
      
      logger.info("Checkout completed successfully", { paymentId: result.paymentId });
      
      return result;
    } catch (error) {
      logger.error("Error during checkout", { error });
      throw new HttpsError(
        "internal",
        "An error occurred while processing the checkout"
      );
    }
  }
);