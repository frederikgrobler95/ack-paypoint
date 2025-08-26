import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase";

// Helper function to generate unique QR code labels
const generateUniqueQrCodeLabel = async (): Promise<string> => {
  const label = `BASAAR-${String(Math.floor(100000 + Math.random() * 900000))}`;
  const qrCodeDoc = await db.collection("qrCodes").where("label", "==", label).limit(1).get();
  
  if (qrCodeDoc.empty) {
    return label;
  }
  
  // If label exists, generate a new one recursively
  return generateUniqueQrCodeLabel();
};

// Helper function to create a customer with QR code
const createCustomerWithQrCode = async (
  transaction: FirebaseFirestore.Transaction,
  customerData: { name: string; phoneE164: string; phoneRaw: string },
  batchId: string
) => {
  // Generate a unique QR code for this customer
  const qrCodeLabel = await generateUniqueQrCodeLabel();
  
  // Create QR code document
  const qrCodeData = {
    label: qrCodeLabel,
    status: "assigned",
    assignedCustomerId: null, // Will be updated after customer creation
    batchId: batchId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  
  const qrCodeDocRef = db.collection("qrCodes").doc(qrCodeLabel);
  transaction.set(qrCodeDocRef, qrCodeData);
  
  // Create customer document
  const customerDataWithQr = {
    ...customerData,
    qrCodeId: qrCodeLabel,
    createdAt: FieldValue.serverTimestamp(),
  };
  
  const customerDocRef = db.collection("customers").doc();
  transaction.set(customerDocRef, customerDataWithQr);
  
  // Update QR code with assigned customer ID
  transaction.update(qrCodeDocRef, {
    assignedCustomerId: customerDocRef.id,
    updatedAt: FieldValue.serverTimestamp(),
  });
  
  // Create account document
  const accountData = {
    customerId: customerDocRef.id,
    balanceCents: 0,
    status: "unpaid",
    createdAt: FieldValue.serverTimestamp(),
  };
  
  const accountDocRef = db.collection("accounts").doc();
  transaction.set(accountDocRef, accountData);
  
  return {
    customerId: customerDocRef.id,
    qrCodeId: qrCodeLabel,
    accountId: accountDocRef.id,
  };
};

export const createAdminCustomers = https.onCall({ region: "africa-south1" }, async (request) => {
  const { customers, batchName } = request.data;
  const uid = request.auth?.uid;

  if (!uid) {
    throw new https.HttpsError("unauthenticated", "User is not authenticated.");
  }

  // Check if user is admin
  const userDoc = await db.collection("users").doc(uid).get();
  const userData = userDoc.data();
  
  if (!userDoc.exists || userData?.role !== "admin") {
    throw new https.HttpsError("permission-denied", "Only administrators can create customers.");
  }

  // Basic validation
  if (!customers || !Array.isArray(customers) || customers.length === 0) {
    throw new https.HttpsError("invalid-argument", "Customers array is required and cannot be empty.");
  }

  if (!batchName || typeof batchName !== "string") {
    throw new https.HttpsError("invalid-argument", "Batch name is required.");
  }

  try {
    const result = await db.runTransaction(async (transaction) => {
      // Check if a batch with the same name already exists
      const existingBatchQuery = await db.collection("qrBatches")
        .where("batchName", "==", batchName)
        .limit(1)
        .get();

      let batchId: string;
      let batchDocRef: FirebaseFirestore.DocumentReference;

      if (!existingBatchQuery.empty) {
        // Use existing batch
        const existingBatch = existingBatchQuery.docs[0];
        batchId = existingBatch.id;
        batchDocRef = existingBatch.ref;

        // Update the existing batch count by adding the new customers
        const existingBatchData = existingBatch.data();
        const currentCount = existingBatchData?.count || 0;
        transaction.update(batchDocRef, {
          count: currentCount + customers.length,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // Create a new batch document
        const batchData = {
          batchName,
          generatedBy: uid,
          count: customers.length,
          createdAt: FieldValue.serverTimestamp(),
        };

        batchDocRef = db.collection("qrBatches").doc();
        transaction.set(batchDocRef, batchData);
        batchId = batchDocRef.id;
      }

      // Create customers with QR codes
      const createdCustomers = [];
      
      for (const customer of customers) {
        // Validate customer data
        if (!customer.name || !customer.phoneE164 || !customer.phoneRaw) {
          throw new https.HttpsError("invalid-argument", "Each customer must have name, phoneE164, and phoneRaw.");
        }
        
        const createdCustomer = await createCustomerWithQrCode(transaction, customer, batchId);
        createdCustomers.push({
          ...customer,
          ...createdCustomer,
        });
      }

      return {
        status: "success",
        batchId,
        customers: createdCustomers,
        count: createdCustomers.length,
      };
    });

    logger.info("Admin customers created successfully", { 
      count: result.count, 
      batchId: result.batchId, 
      uid 
    });

    return result;
  } catch (error: any) {
    logger.error("Error creating admin customers", {
      error: error.message,
      code: error.code || 'unknown',
      stack: error.stack,
      uid,
      timestamp: new Date().toISOString()
    });

    if (error instanceof https.HttpsError) {
      throw error;
    }
    
    throw new https.HttpsError("internal", "An internal error occurred while creating customers.");
  }
});