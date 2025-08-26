import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase";
import {FieldValue} from "firebase-admin/firestore";

// Helper function to generate unique QR code labels
const generateUniqueRandomCode = async (): Promise<string> => {
    const code = `BASAAR-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const snapshot = await db.collection('qrCodes').where('label', '==', code).get();
    if (snapshot.empty) {
        return code;
    }
    return generateUniqueRandomCode();
};

// Callable function to generate a batch of QR codes
export const generateQrBatch = https.onCall({ region: "africa-south1" }, async (request) => {
  logger.info("Generate QR batch callable function started", { structuredData: true });
  
  try {
    // Get parameters from request data
    const { count, batchName } = request.data;
    const userId = request.auth?.uid;
    
    logger.info("Received parameters", { count, batchName, userId });
    
    // Validate input
    if (!userId) {
      throw new https.HttpsError("unauthenticated", "User must be authenticated");
    }
    
    if (!batchName || typeof batchName !== 'string') {
      throw new https.HttpsError("invalid-argument", "Invalid request: batchName is required and must be a string");
    }
    
    if (!count || typeof count !== 'number' || count <= 0) {
      throw new https.HttpsError("invalid-argument", "Invalid request: count is required and must be a positive number");
    }
    
    // Limit the number of QR codes that can be generated at once
    if (count > 500) {
      throw new https.HttpsError("invalid-argument", "Too many QR codes requested. Maximum is 500.");
    }
    
    // First, check if a batch with this name already exists
    const existingBatchSnapshot = await db.collection('qrBatches')
      .where('batchName', '==', batchName)
      .get();
    
    let batchId: string;
    let batchData: any;
    
    if (!existingBatchSnapshot.empty) {
      // Use existing batch
      const existingBatchDoc = existingBatchSnapshot.docs[0];
      batchId = existingBatchDoc.id;
      
      // Get the existing batch data
      const existingBatch = existingBatchDoc.data();
      
      // Update the existing batch with new count
      batchData = {
        batchName: existingBatch.batchName,
        generatedBy: existingBatch.generatedBy,
        count: existingBatch.count + count,
        createdAt: existingBatch.createdAt,
      };
      
      // Update the existing batch document with new count
      await db.collection('qrBatches').doc(batchId).update({ count: batchData.count });
      
      logger.info("Updated existing batch", { batchId, newCount: batchData.count });
    } else {
      // Create a new batch document
      batchData = {
        batchName,
        generatedBy: userId,
        count,
        createdAt: FieldValue.serverTimestamp(),
      };
      
      const batchDocRef = await db.collection('qrBatches').add(batchData);
      batchId = batchDocRef.id;
      
      logger.info("Created new batch", { batchId });
    }
    
    // Generate QR codes
    const codes: any[] = [];
    const batch = db.batch();
    
    for (let i = 0; i < count; i++) {
      const label = await generateUniqueRandomCode();
      const qrCodeData = {
        label,
        status: 'unassigned',
        assignedCustomerId: null,
        batchId: batchId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      const qrCodeDocRef = db.collection('qrCodes').doc(label);
      batch.set(qrCodeDocRef, qrCodeData);
      
      codes.push({
        id: label,
        ...qrCodeData
      });
    }
    
    // Commit the batch
    await batch.commit();
    
    logger.info("Generated QR codes", { count: codes.length, batchId });
    
    // Return success response
    return {
      success: true,
      batch: { id: batchId, ...batchData },
      codes
    };
  } catch (error: any) {
    logger.error("Error generating QR batch", { error: error.message, stack: error.stack });
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError("internal", `Failed to generate QR batch: ${error.message}`);
  }
});