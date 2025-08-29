import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

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
  phone: string;
  qrCodeId: string;
  Account: Account;
  idempotencyKey?: string;
}

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
  createdAt: Timestamp;
}

interface CancelTransactionRequest {
  idempotencyKey: string;
}

interface CancelTransactionResponse {
  success: boolean;
  message?: string;
}

export const cancelTransaction = onCall({
  region: "africa-south1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request): Promise<CancelTransactionResponse> => {
    // Get the idempotency key from the request
    const { idempotencyKey } = request.data as CancelTransactionRequest;
    
    // Check if a transaction with this idempotencyKey exists
    const existingTransactionQuery = await db
      .collection("transactions")
      .where("idempotencyKey", "==", idempotencyKey)
      .limit(1)
      .get();
      
    if (existingTransactionQuery.empty) {
      // No transaction found with this idempotency key
      return { success: false, message: "Transaction not found" };
    }
    
    // Get the existing transaction
    const transactionDoc = existingTransactionQuery.docs[0];
    const transaction = transactionDoc.data() as Transaction;
    
    // Use a transaction to ensure atomicity
    await db.runTransaction(async (firestoreTransaction) => {
      // Delete the transaction document
      firestoreTransaction.delete(transactionDoc.ref);
      
      // Get the customer document
      const customerRef = db.collection("customers").doc(transaction.customerId);
      const customerDoc = await firestoreTransaction.get(customerRef);
      
      if (!customerDoc.exists) {
        throw new Error(`Customer with ID ${transaction.customerId} not found`);
      }
      
      const customer = customerDoc.data() as Customer;
      
      // Calculate new balance (subtracting transaction amount since we're canceling)
      // This reverses what was done in createTransaction
      const newBalanceCents = customer.Account.balanceCents - transaction.amountCents;
      
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
      firestoreTransaction.update(customerRef, {
        Account: updatedAccount,
      });
    });
    
    // Return success
    return { success: true, message: "Transaction canceled successfully" };
  }
);