import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase";
import { firestore } from "firebase-admin";
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

interface CreateCustomerRequest {
  registration: Omit<Registration, "id" | "createdAt" | "customerId"> & {
    phone?: string;
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

      if (!registration) {
        logger.error("Error creating customer: registration data is missing.");
        throw new https.HttpsError("invalid-argument", "Registration data is required.");
      }

      const idemDoc = await firestore().collection("_idem").doc(registration.idempotencyKey).get();
      if (idemDoc.exists) {
        throw new https.HttpsError(
          "already-exists",
          `A registration with this key already exists.`
        );
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
        createdAt: FieldValue.serverTimestamp() as any,
        idempotencyKey: registration.idempotencyKey,
      };
      
      // Create the customer document
      const customerDoc: Customer = {
        id: customerId,
        name: registration.customerName,
        phone: registration.phone || "",
        qrCodeId: registration.qrCodeId,
        Account: {
          balanceCents: 0,
          status: "clean" as AccountStatus,
          lastPaidAt: FieldValue.serverTimestamp() as any,
        },
        idempotencyKey: registration.idempotencyKey,
      };
      
      // Use a transaction to ensure atomicity
      await db.runTransaction(async (transaction) => {
        const qrCodeRef = db.collection("qrCodes").doc(registration.qrCodeId);
        const qrCodeDoc = await transaction.get(qrCodeRef);

        if (!qrCodeDoc.exists) {
          throw new https.HttpsError("not-found", "QR code not found.");
        }

        const qrCode = qrCodeDoc.data();
        if (qrCode?.status !== "unassigned") {
          throw new https.HttpsError("failed-precondition", "QR code is not available.");
        }
        
        // Save the registration document
        const registrationRef = db.collection("registrations").doc(registrationDoc.id);
        transaction.set(registrationRef, registrationDoc);
        
        // Save the customer document
        const customerRef = db.collection("customers").doc(customerDoc.id);
        transaction.set(customerRef, customerDoc);

        // Update the QR code status
        transaction.update(qrCodeRef, {
          status: "assigned",
          assignedCustomerId: customerId,
        });
      });

      await firestore().collection("_idem").doc(registration.idempotencyKey).set({
        type: "registration",
        createdAt: firestore.FieldValue.serverTimestamp(),
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
      
      throw new https.HttpsError("internal", error.message || "Internal server error");
    }
  }
);