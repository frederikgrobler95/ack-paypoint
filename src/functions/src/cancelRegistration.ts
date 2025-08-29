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
  phone: string;
  qrCodeId: string;
  Account: Account;
  idempotencyKey?: string;
}

interface Registration {
  id: string;
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  createdAt: Timestamp;
  idempotencyKey: string;
}

interface CancelRegistrationRequest {
  idempotencyKey: string;
}

interface CancelRegistrationResponse {
  success: boolean;
  message?: string;
}

export const cancelRegistration = onCall({
  region: "africa-south1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10
}, async (request): Promise<CancelRegistrationResponse> => {
    // Get the idempotency key from the request
    const { idempotencyKey } = request.data as CancelRegistrationRequest;
    
    // Check if a registration with this idempotencyKey exists
    const existingRegistrationQuery = await db
      .collection("registrations")
      .where("idempotencyKey", "==", idempotencyKey)
      .limit(1)
      .get();
      
    if (existingRegistrationQuery.empty) {
      // No registration found with this idempotency key
      return { success: false, message: "Registration not found" };
    }
    
    // Get the existing registration
    const registrationDoc = existingRegistrationQuery.docs[0];
    const registration = registrationDoc.data() as Registration;
    
    // Use a transaction to ensure atomicity
    await db.runTransaction(async (firestoreTransaction) => {
      // Delete the registration document
      firestoreTransaction.delete(registrationDoc.ref);
      
      // Get the customer document
      const customerRef = db.collection("customers").doc(registration.customerId);
      const customerDoc = await firestoreTransaction.get(customerRef);
      
      if (!customerDoc.exists) {
        throw new Error(`Customer with ID ${registration.customerId} not found`);
      }
      
      const customer = customerDoc.data() as Customer;
      
      // Verify that the customer has the same idempotency key
      if (customer.idempotencyKey !== idempotencyKey) {
        throw new Error(`Customer idempotency key mismatch`);
      }
      
      // Delete the customer document
      firestoreTransaction.delete(customerRef);
    });
    
    // Return success
    return { success: true, message: "Registration canceled successfully" };
  }
);