import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

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

interface CreateTransactionRequest {
  transaction: Omit<Transaction, "id" | "createdAt">;
}

interface CreateTransactionResponse {
  transaction: Transaction;
}

export const createTransaction = onCall({
  region: "africa-south1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request): Promise<CreateTransactionResponse> => {
    // Get the transaction data from the request
    const { transaction } = request.data as CreateTransactionRequest;
    
    // Check if a transaction with this idempotencyKey already exists
    const existingTransactionQuery = await db
      .collection("transactions")
      .where("idempotencyKey", "==", transaction.idempotencyKey)
      .limit(1)
      .get();
      
    if (!existingTransactionQuery.empty) {
      // Return the existing transaction if found
      const existingTransaction = existingTransactionQuery.docs[0].data() as Transaction;
      return { transaction: existingTransaction };
    }
    
    // Generate a new transaction ID
    const transactionId = db.collection("transactions").doc().id;
    
    // Create the transaction document
    const transactionDoc: Transaction = {
      id: transactionId,
      stallId: transaction.stallId,
      stallName: transaction.stallName,
      operatorId: transaction.operatorId,
      operatorName: transaction.operatorName,
      customerId: transaction.customerId,
      customerName: transaction.customerName,
      amountCents: transaction.amountCents,
      type: transaction.type,
      refundOfTxnId: transaction.refundOfTxnId,
      idempotencyKey: transaction.idempotencyKey,
      createdAt: FieldValue.serverTimestamp() as any,
    };
    
    // Use a transaction to ensure atomicity
    await db.runTransaction(async (firestoreTransaction) => {
      // Save the transaction document
      const transactionRef = db.collection("transactions").doc(transactionDoc.id);
      firestoreTransaction.set(transactionRef, transactionDoc);
      
      // Get the customer document
      const customerRef = db.collection("customers").doc(transaction.customerId);
      const customerDoc = await firestoreTransaction.get(customerRef);
      
      if (!customerDoc.exists) {
        throw new Error(`Customer with ID ${transaction.customerId} not found`);
      }
      
      const customer = customerDoc.data() as Customer;
      
      // Calculate new balance (adding transaction amount - positive for sales, negative for refunds)
      const newBalanceCents = customer.Account.balanceCents + transaction.amountCents;
      
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
    
    // Return the created transaction
    return { transaction: transactionDoc };
  }
);