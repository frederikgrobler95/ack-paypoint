import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
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

interface Registration {
  id: string;
  operatorName: string;
  stallId: string;
  customerId: string;
  customerName: string;
  qrCodeId: string;
  createdAt: string; // ISO string
  idempotencyKey: string;
}

interface CreateCustomerRequest {
  registration: Omit<Registration, "id" | "createdAt" | "customerId"> & {
    phoneE164?: string;
    phoneRaw?: string;
    stallId: string;
  };
}

interface CreateCustomerResponse {
  customer: Customer;
}

export const createCustomer = https.onCall({
  region: "africa-south1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 10,
  cpu: 1,
  concurrency: 1000
}, async (request): Promise<CreateCustomerResponse> => {
    try {
      // Get the registration data from the request
      const { registration } = request.data as CreateCustomerRequest;
      
      // Check if a customer with this idempotencyKey already exists
      const existingCustomerQuery = await db
        .collection("customers")
        .where("IdempotencyKey", "==", registration.idempotencyKey)
        .limit(1)
        .get();
        
      if (!existingCustomerQuery.empty) {
        // Return the existing customer if found
        const existingCustomer = existingCustomerQuery.docs[0].data() as Customer;
        return { customer: existingCustomer };
      }
      
      // Generate a new customer ID
      const customerId = db.collection("customers").doc().id;
      
      // Create the registration document
      const registrationDoc: Registration = {
        id: db.collection("registrations").doc().id,
        operatorName: registration.operatorName,
        stallId: registration.stallId,
        customerId: customerId,
        customerName: registration.customerName,
        qrCodeId: registration.qrCodeId,
        createdAt: new Date().toISOString(),
        idempotencyKey: registration.idempotencyKey,
      };
      
      // Create the customer document
      const customerDoc: Customer = {
        id: customerId,
        name: registration.customerName,
        phoneE164: registration.phoneE164 || "",
        phoneRaw: registration.phoneRaw || "",
        qrCodeId: registration.qrCodeId,
        Account: {
          balanceCents: 0,
          status: "clean" as AccountStatus,
          lastPaidAt: new Date(),
        },
        IdempotencyKey: registration.idempotencyKey,
      };
      
      // Use a transaction to ensure atomicity
      await db.runTransaction(async (transaction) => {
        // Save the registration document
        const registrationRef = db.collection("registrations").doc(registrationDoc.id);
        transaction.set(registrationRef, registrationDoc);
        
        // Save the customer document
        const customerRef = db.collection("customers").doc(customerDoc.id);
        transaction.set(customerRef, customerDoc);
      });
      
      // Log successful creation
      logger.info("Customer created successfully", {
        customerId: customerDoc.id,
        idempotencyKey: registration.idempotencyKey
      });
      
      // Return the created customer
      return { customer: customerDoc };
    } catch (error: any) {
      logger.error("Error creating customer", {
        error: error.message,
        stack: error.stack
      });
      
      throw new https.HttpsError("internal", "An internal error occurred while creating customer.");
    }
  }
);