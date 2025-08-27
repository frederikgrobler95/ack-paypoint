import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";

// Local interfaces to replace shared contracts
type AccountStatus = 'clean' | 'unpaid' | 'paid';

interface Account {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: Date;
}

interface Customer {
  id: string;
  name: string;
  phoneE164: string;
  phoneRaw: string;
  qrCodeId: string;
  Account: Account;
  IdempotencyKey?: string;
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
  createdAt: Date;
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
    
    // Check if a payment with this idempotencyKey already exists
    const existingPaymentQuery = await db
      .collection("payments")
      .where("idempotencyKey", "==", payment.idempotencyKey)
      .limit(1)
      .get();
      
    if (!existingPaymentQuery.empty) {
      // Return the existing payment if found
      const existingPayment = existingPaymentQuery.docs[0].data() as Payment;
      return { payment: existingPayment };
    }
    
    // Generate a new payment ID
    const paymentId = db.collection("payments").doc().id;
    
    // Create the payment document
    const paymentDoc: Payment = {
      id: paymentId,
      method: payment.method,
      amountCents: payment.amountCents,
      operatorId: payment.operatorId,
      operatorName: payment.operatorName,
      customerId: payment.customerId,
      customerName: payment.customerName,
      stallId: payment.stallId,
      idempotencyKey: payment.idempotencyKey,
      createdAt: new Date(),
    };
    
    // Use a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Save the payment document
      const paymentRef = db.collection("payments").doc(paymentDoc.id);
      transaction.set(paymentRef, paymentDoc);
      
      // Get the customer document
      const customerRef = db.collection("customers").doc(payment.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (!customerDoc.exists) {
        throw new Error(`Customer with ID ${payment.customerId} not found`);
      }
      
      const customer = customerDoc.data() as Customer;
      
      // Calculate new balance (subtracting payment amount)
      const newBalanceCents = customer.Account.balanceCents - payment.amountCents;
      
      // Determine new status based on balance
      let newStatus: AccountStatus = "clean";
      if (newBalanceCents > 0) {
        newStatus = "unpaid";
      }
      
      // Update the customer's account
      const updatedAccount = {
        ...customer.Account,
        balanceCents: newBalanceCents,
        status: newStatus,
      };
      
      // Update customer document
      transaction.update(customerRef, {
        Account: updatedAccount,
      });
    });
    
    // Return the created payment
    return { payment: paymentDoc };
  }
);