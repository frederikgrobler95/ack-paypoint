import * as https from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase";
import { generateQrPdfBuffer } from "./qrPdfGenerator";

// Callable function to generate a PDF for all QR codes in a batch
export const generateBatchQrCodesPdf = https.onCall({ region: "africa-south1" }, async (request) => {
  logger.info("Generate batch QR codes PDF callable function started", { structuredData: true });
  
  try {
    // Get batch ID from request data
    const { batchId } = request.data;
    logger.info("Received batch ID", { batchId });
    
    // Validate input
    if (!batchId || typeof batchId !== 'string') {
      throw new https.HttpsError("invalid-argument", "Invalid request: batchId is required and must be a string");
    }
    
    // Fetch all QR codes for this batch from Firestore
    logger.info("Fetching all QR codes for batch", { batchId });
    
    // Query all QR codes in the batch
    const qrCodesSnapshot = await db.collection("qrCodes")
      .where("batchId", "==", batchId)
      .orderBy("label")
      .get();
    
    logger.info("Fetched QR codes snapshot", { count: qrCodesSnapshot.size });
    
    // Check if we found any QR codes
    if (qrCodesSnapshot.empty) {
      throw new https.HttpsError("not-found", "No QR codes found for the provided batch ID");
    }
    
    // Process all QR codes
    const qrCodes: any[] = [];
    qrCodesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        // Validate required fields
        if (!data.label) {
          logger.warn("QR code missing label", { id: doc.id });
          return;
        }
        
        logger.info("QR code data", { id: doc.id, label: data.label, status: data.status });
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
    });
    
    logger.info("Processed QR codes", { count: qrCodes.length });
    
    // Check if we processed any QR codes
    if (qrCodes.length === 0) {
      throw new https.HttpsError("not-found", "No valid QR codes found for the provided batch ID");
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
    logger.error("Error generating batch QR codes PDF", { error: error.message, stack: error.stack });
    if (error instanceof https.HttpsError) {
      throw error;
    }
    throw new https.HttpsError("internal", `Failed to generate PDF: ${error.message}`);
  }
});