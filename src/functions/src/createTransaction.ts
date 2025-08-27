import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

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

    if (!transaction) {
      throw new HttpsError("invalid-argument", "Transaction data is required.");
    }

    const idemDoc = await db.collection("_idem").doc(transaction.idempotencyKey).get();
    if (idemDoc.exists) {
      throw new HttpsError(
        "already-exists",
        `A transaction with this key already exists.`
      );
    }
    
    // Generate a new transaction ID
    const transactionId = db.collection("transactions").doc().id;
    
    // Create the transaction document (filter out undefined values)
    const transactionDoc: any = {
      id: transactionId,
      stallId: transaction.stallId,
      operatorId: transaction.operatorId,
      operatorName: transaction.operatorName,
      customerId: transaction.customerId,
      amountCents: transaction.amountCents,
      type: transaction.type,
      idempotencyKey: transaction.idempotencyKey,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Only add optional fields if they have values
    if (transaction.stallName) {
      transactionDoc.stallName = transaction.stallName;
    }
    if (transaction.customerName) {
      transactionDoc.customerName = transaction.customerName;
    }
    if (transaction.refundOfTxnId) {
      transactionDoc.refundOfTxnId = transaction.refundOfTxnId;
    }
    

    try {
       // Use a transaction to ensure atomicity
    await db.runTransaction(async (firestoreTransaction) => {
      // READS FIRST: Get the customer document
      const customerRef = db.collection("customers").doc(transaction.customerId);
      const customerDoc = await firestoreTransaction.get(customerRef);
      
      if (!customerDoc.exists) {
        throw new HttpsError("not-found", `Customer with ID ${transaction.customerId} not found`);
      }
      
      // Convert Firestore Timestamp to Date for the lastPaidAt field
      const customerData = customerDoc.data();
      if (!customerData) {
        throw new HttpsError("not-found", `Customer data for ID ${transaction.customerId} is invalid`);
      }
      
      const customer: Customer = {
        id: customerData.id,
        name: customerData.name,
        phoneE164: customerData.phoneE164,
        phoneRaw: customerData.phoneRaw,
        qrCodeId: customerData.qrCodeId,
        Account: {
          balanceCents: customerData.Account?.balanceCents || 0,
          status: customerData.Account?.status || "clean",
          lastPaidAt: customerData.Account?.lastPaidAt instanceof Timestamp
            ? customerData.Account.lastPaidAt
            : Timestamp.fromDate(customerData.Account?.lastPaidAt ? new Date(customerData.Account.lastPaidAt) : new Date())
        },
        idempotencyKey: customerData.idempotencyKey
      };
      
      
      // Validate transaction type
      if (transaction.type !== 'sale' && transaction.type !== 'refund') {
        throw new HttpsError("invalid-argument", `Invalid transaction type: ${transaction.type}`);
      }
      
      // Calculate new balance based on transaction type
      // For sales: add amount (positive value)
      // For refunds: subtract amount (positive value, but we subtract it)
      const balanceAdjustment = transaction.type === 'sale'
        ? transaction.amountCents
        : -transaction.amountCents;
      const newBalanceCents = customer.Account.balanceCents + balanceAdjustment;
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
      
      // WRITES SECOND: Save the transaction document
      const transactionRef = db.collection("transactions").doc(transactionDoc.id);
      firestoreTransaction.set(transactionRef, transactionDoc);
      
      // Update customer document
      firestoreTransaction.update(customerRef, {
        Account: updatedAccount,
      });
    });
    } catch (error:any) {
      console.error("Transaction failed: ", error);
      throw new HttpsError("internal", error.message);
    }
   

    await db.collection("_idem").doc(transaction.idempotencyKey).set({
      type: "transaction",
      createdAt: FieldValue.serverTimestamp(),
    });
    
    // Return the created transaction
    return { transaction: transactionDoc };
  }
);