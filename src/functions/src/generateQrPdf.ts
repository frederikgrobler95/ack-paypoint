import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase";
import { generateQrPdfBuffer } from "./qrPdfGenerator";

// Callable function for use with Firebase SDK (supports emulators)
export const generateQrCodesPdf = https.onCall({ region: "africa-south1" }, async (request) => {
  logger.info("Generate QR codes PDF callable function started", { structuredData: true });
  
  try {
    // Get QR code IDs from request data
    const { qrCodeIds, batchId } = request.data;
    logger.info("Received QR code IDs", { count: qrCodeIds?.length, qrCodeIds, batchId });
    
    // Validate input
    if (!qrCodeIds || !Array.isArray(qrCodeIds) || qrCodeIds.length === 0) {
      throw new https.HttpsError("invalid-argument", "Invalid request: qrCodeIds array is required and cannot be empty");
    }
    
    // Limit the number of QR codes that can be generated at once
    if (qrCodeIds.length > 500) {
      throw new https.HttpsError("invalid-argument", "Too many QR codes requested. Maximum is 500.");
    }
    
    // Fetch QR codes from Firestore
    const qrCodes: any[] = [];
    logger.info("Fetching QR codes from Firestore", { qrCodeIds });
    
    // Process in batches of 10 to avoid Firestore limits
    for (let i = 0; i < qrCodeIds.length; i += 10) {
      const batch = qrCodeIds.slice(i, i + 10);
      logger.info("Processing batch", { batchIndex: i, batchSize: batch.length, batch });
      await Promise.all(
        batch.map(async (id) => {
          try {
            logger.info("Fetching QR code", { id });
            const doc = await db.collection("qrCodes").doc(id).get();
            logger.info("QR code fetch result", { id, exists: doc.exists });
            if (doc.exists) {
              const data = doc.data();
              if (data) {
                // Validate required fields
                if (!data.label) {
                  logger.warn("QR code missing label", { id });
                  return;
                }
                
                logger.info("QR code data", { id, label: data.label, status: data.status });
                qrCodes.push({
                  id: doc.id,
                  label: data.label,
                  status: data.status || 'unassigned',
                  assignedCustomerId: data.assignedCustomerId || null,
                  batchId: data.batchId || null,
                  createdAt: data.createdAt || new Date().toISOString(),
                  updatedAt: data.updatedAt || new Date().toISOString()
                });
              }
            } else {
              logger.info("QR code not found", { id });
            }
          } catch (error) {
            logger.error("Error fetching QR code", { id, error });
          }
        })
      );
    }
    
    logger.info("Fetched QR codes", { count: qrCodes.length });
    
    // Check if we found any QR codes
    if (qrCodes.length === 0) {
      throw new https.HttpsError("not-found", "No QR codes found for the provided IDs");
    }
    
    // Generate PDF
    logger.info("Generating PDF");
    const pdfBuffer = await generateQrPdfBuffer(qrCodes);
    logger.info("PDF generated successfully", { size: pdfBuffer.length });
    
    // Convert buffer to base64 for transport
    const base64Data = pdfBuffer.toString('base64');
    
    // Return the base64 data
    return {
      success: true,
      data: base64Data,
      message: "PDF generated successfully"
    };
  } catch (error: any) {
    logger.error("Error generating QR codes PDF", { error: error.message, stack: error.stack });
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError("internal", `Failed to generate PDF: ${error.message}`);
  }
});