import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";

// Local interfaces to replace shared contracts
type AccountStatus = 'clean' | 'unpaid' | 'paid';

interface Account {
  balanceCents: number;
  status: AccountStatus;
  lastPaidAt: Timestamp;
}

interface Customer {
  id: string;
  name: string;
  phoneE164: string;
  phoneRaw: string;
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
  createdAt: Timestamp;
}

interface CancelPaymentRequest {
  idempotencyKey: string;
}

interface CancelPaymentResponse {
  success: boolean;
  message?: string;
}

export const cancelPayment = onCall({
  region: "africa-south1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request): Promise<CancelPaymentResponse> => {
    // Get the idempotency key from the request
    const { idempotencyKey } = request.data as CancelPaymentRequest;
    
    // Check if a payment with this idempotencyKey exists
    const existingPaymentQuery = await db
      .collection("payments")
      .where("idempotencyKey", "==", idempotencyKey)
      .limit(1)
      .get();
      
    if (existingPaymentQuery.empty) {
      // No payment found with this idempotency key
      return { success: false, message: "Payment not found" };
    }
    
    // Get the existing payment
    const paymentDoc = existingPaymentQuery.docs[0];
    const payment = paymentDoc.data() as Payment;
    
    // Use a transaction to ensure atomicity
    await db.runTransaction(async (transaction) => {
      // Delete the payment document
      transaction.delete(paymentDoc.ref);
      
      // Get the customer document
      const customerRef = db.collection("customers").doc(payment.customerId);
      const customerDoc = await transaction.get(customerRef);
      
      if (!customerDoc.exists) {
        throw new Error(`Customer with ID ${payment.customerId} not found`);
      }
      
      const customer = customerDoc.data() as Customer;
      
      // Calculate new balance (adding back the payment amount since we're canceling)
      const newBalanceCents = customer.Account.balanceCents + payment.amountCents;
      
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
    
    // Return success
    return { success: true, message: "Payment canceled successfully" };
  }
);