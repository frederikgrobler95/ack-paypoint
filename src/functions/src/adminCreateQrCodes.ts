import { onCall } from "firebase-functions/v2/https";
import { db } from "./firebase";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// Local interfaces to replace shared contracts
type QRCodeStatus = 'unassigned' | 'assigned' | 'void' | 'lost';

interface QRCode {
  id: string;
  label: string;
  status: QRCodeStatus;
  assignedCustomerId: string | null;
  batchId: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface QRBatch {
  id: string;
  batchName: string;
  createdAt: Timestamp;
  generatedBy: string; // userId
  count: number;
}

interface AdminCreateQrCodesRequest {
  amount: number;
  batchId?: string;
  name?: string; // Used when creating a new batch
  prefix?: string; // Custom prefix for QR codes
}

interface AdminCreateQrCodesResponse {
  qrCodes: QRCode[];
  batchId: string;
}

export const adminCreateQrCodes = onCall({
  region: "africa-south1",
  memory: "512MiB",
  timeoutSeconds: 120,
  maxInstances: 5
}, async (request): Promise<AdminCreateQrCodesResponse> => {
    // Get the request data
    const { amount, batchId, name, prefix } = request.data as AdminCreateQrCodesRequest;
    
    // Validate the amount
    if (!amount || amount <= 0) {
      throw new Error("Amount must be a positive number");
    }
    
    // Limit the number of QR codes that can be generated at once
    if (amount > 1000) {
      throw new Error("Cannot generate more than 1000 QR codes at once");
    }
    
    let targetBatchId: string;
    let batchRef: FirebaseFirestore.DocumentReference;
    
    // Check if batchId is provided
    if (batchId) {
      // Use existing batch
      targetBatchId = batchId;
      batchRef = db.collection("qrBatches").doc(batchId);
      
      // Verify the batch exists
      const batchDoc = await batchRef.get();
      if (!batchDoc.exists) {
        throw new Error(`Batch with ID ${batchId} not found`);
      }
    } else {
      // Create a new batch
      if (!name) {
        throw new Error("Name is required when creating a new batch");
      }
      
      // Generate a new batch ID
      targetBatchId = db.collection("qrBatches").doc().id;
      batchRef = db.collection("qrBatches").doc(targetBatchId);
      
      // Create the batch document
      const batchDoc: QRBatch = {
        id: targetBatchId,
        batchName: name,
        createdAt: FieldValue.serverTimestamp() as any,
        generatedBy: request.auth?.uid || "unknown",
        count: 0, // Will be updated later
      };
      
      // Save the batch document
      await batchRef.set(batchDoc);
    }
    
    // Generate the QR codes
    const qrCodes: QRCode[] = [];
    
    // If a prefix is provided, check for duplicates first
    if (prefix) {
      // Generate QR codes with prefix and check for duplicates
      const generatedLabels = new Set<string>();
      for (let i = 0; i < amount; i++) {
        let label: string;
        let attempts = 0;
        
        // Try to generate a unique label (up to 10 attempts)
        do {
          const randomSuffix = Math.floor(100000 + Math.random() * 900000);
          label = `${prefix}-${randomSuffix}`;
          attempts++;
          
          // If we've tried 10 times and still have duplicates, throw an error
          if (attempts >= 10) {
            throw new Error("Unable to generate unique QR code labels. Please try a different prefix.");
          }
        } while (generatedLabels.has(label));
        
        generatedLabels.add(label);
      }
      
      // Check if any of these labels already exist in the database
      const existingLabels: string[] = [];
      for (const label of Array.from(generatedLabels)) {
        const existingQrQuery = db.collection("qrCodes").where("label", "==", label).limit(1);
        const existingQrSnapshot = await existingQrQuery.get();
        
        if (!existingQrSnapshot.empty) {
          existingLabels.push(label);
        }
      }
      
      // If we found existing labels, try to generate new ones
      if (existingLabels.length > 0) {
        for (const existingLabel of existingLabels) {
          let newLabel: string;
          let attempts = 0;
          
          do {
            const randomSuffix = Math.floor(100000 + Math.random() * 900000);
            newLabel = `${prefix}-${randomSuffix}`;
            attempts++;
            
            // If we've tried 10 times and still have duplicates, throw an error
            if (attempts >= 10) {
              throw new Error("Unable to generate unique QR code labels. Please try a different prefix.");
            }
          } while (generatedLabels.has(newLabel) || existingLabels.includes(newLabel));
          
          // Replace the existing label with the new one
          generatedLabels.delete(existingLabel);
          generatedLabels.add(newLabel);
        }
      }
      
      // Convert the set back to an array for processing
      const uniqueLabels = Array.from(generatedLabels);
      
      // Use a transaction to ensure atomicity
      await db.runTransaction(async (transaction) => {
        // Get the current batch document
        const batchDoc = await transaction.get(batchRef);
        if (!batchDoc.exists) {
          throw new Error(`Batch with ID ${targetBatchId} not found`);
        }
        
        const batch = batchDoc.data() as QRBatch;
        
        // Generate the specified amount of QR codes
        for (let i = 0; i < amount; i++) {
          // Generate a new QR code ID
          const qrCodeId = db.collection("qrCodes").doc().id;
          
          // Create the QR code document
          const qrCodeDoc: QRCode = {
            id: qrCodeId,
            label: uniqueLabels[i],
            status: "unassigned" as QRCodeStatus,
            assignedCustomerId: null,
            batchId: targetBatchId,
            createdAt: FieldValue.serverTimestamp() as any,
            updatedAt: FieldValue.serverTimestamp() as any,
          };
          
          // Add to the array
          qrCodes.push(qrCodeDoc);
          
          // Add to batch updates
          const qrCodeRef = db.collection("qrCodes").doc(qrCodeId);
          transaction.set(qrCodeRef, qrCodeDoc);
        }
        
        // Update the batch count
        transaction.update(batchRef, {
          count: batch.count + amount,
        });
      });
    } else {
      // Use a transaction to ensure atomicity for default QR codes
      await db.runTransaction(async (transaction) => {
        // Get the current batch document
        const batchDoc = await transaction.get(batchRef);
        if (!batchDoc.exists) {
          throw new Error(`Batch with ID ${targetBatchId} not found`);
        }
        
        const batch = batchDoc.data() as QRBatch;
        
        // Generate the specified amount of QR codes
        for (let i = 0; i < amount; i++) {
          // Generate a new QR code ID
          const qrCodeId = db.collection("qrCodes").doc().id;
          
          // Create the QR code document
          const qrCodeDoc: QRCode = {
            id: qrCodeId,
            label: `QR-${targetBatchId.substring(0, 8)}-${(batch.count + i + 1).toString().padStart(4, "0")}`,
            status: "unassigned" as QRCodeStatus,
            assignedCustomerId: null,
            batchId: targetBatchId,
            createdAt: FieldValue.serverTimestamp() as any,
            updatedAt: FieldValue.serverTimestamp() as any,
          };
          
          // Add to the array
          qrCodes.push(qrCodeDoc);
          
          // Add to batch updates
          const qrCodeRef = db.collection("qrCodes").doc(qrCodeId);
          transaction.set(qrCodeRef, qrCodeDoc);
        }
        
        // Update the batch count
        transaction.update(batchRef, {
          count: batch.count + amount,
        });
      });
    }
    
    // Return the created QR codes and the batchId
    return { qrCodes, batchId: targetBatchId };
  }
);