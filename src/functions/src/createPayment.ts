import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { firestore } from "firebase-admin";
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Local interfaces to replace shared contracts
type AccountStatus = 'clean' | 'unpaid' | 'paid';

interface Account {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: firestore.Timestamp;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  qrCodeId: string;
  Account: Account;
  idempotencyKey?: string;
}

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
  createdAt: firestore.Timestamp;
}

interface CreatePaymentRequest {
  payment: Omit<Payment, "id" | "createdAt">;
}

interface CreatePaymentResponse {
  payment: Payment;
}

export const createPayment = onCall({
  region: "africa-south1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request): Promise<CreatePaymentResponse> => {
    // Get the payment data from the request
    const { payment } = request.data as CreatePaymentRequest;

    if (!payment) {
      throw new HttpsError("invalid-argument", "Payment data is required.");
    }

    const idemDoc = await firestore().collection("_idem").doc(payment.idempotencyKey).get();
    if (idemDoc.exists) {
      throw new HttpsError(
        "already-exists",
        `A payment with this key already exists.`
      );
    }
    
    // Generate a new payment ID
    const paymentId = db.collection("payments").doc().id;
    
    // Create the payment document (filter out undefined values)
    const paymentDoc: any = {
      id: paymentId,
      method: payment.method,
      amountCents: payment.amountCents,
      operatorId: payment.operatorId,
      customerId: payment.customerId,
      stallId: payment.stallId,
      idempotencyKey: payment.idempotencyKey,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (payment.operatorName) {
      paymentDoc.operatorName = payment.operatorName;
    }
    if (payment.customerName) {
      paymentDoc.customerName = payment.customerName;
    }
    
    try {
      // Use a transaction to ensure atomicity
      await db.runTransaction(async (transaction) => {
        // READS FIRST: Get the customer document
        const customerRef = db.collection("customers").doc(payment.customerId);
        const customerDoc = await transaction.get(customerRef);
        
        if (!customerDoc.exists) {
          throw new HttpsError("not-found", `Customer with ID ${payment.customerId} not found`);
        }
        
        const customer = customerDoc.data() as Customer;
        
        // When making a payment, the account should be zeroed and marked as paid
        const newBalanceCents = 0;
        const newStatus: AccountStatus = "paid";
        
        // Update the lastPaidAt timestamp
        const updatedLastPaidAt = FieldValue.serverTimestamp();
        
        // Update the customer's account
        const updatedAccount = {
          ...customer.Account,
          balanceCents: newBalanceCents,
          status: newStatus,
          lastPaidAt: updatedLastPaidAt,
        };
        
        // WRITES SECOND: Save the payment document and update customer
        const paymentRef = db.collection("payments").doc(paymentDoc.id);
        transaction.set(paymentRef, paymentDoc);
        
        // Update customer document
        transaction.update(customerRef, {
          Account: updatedAccount,
        });
      });
    } catch (error: any) {
      console.error("Payment transaction failed: ", error);
      throw new HttpsError("internal", error.message);
    }

    await firestore().collection("_idem").doc(payment.idempotencyKey).set({
      type: "payment",
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    
    // Return the created payment
    return { payment: paymentDoc };
  }
);