"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBatchQrCodesPdf = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("./firebase");
const qrPdfGenerator_1 = require("./qrPdfGenerator");
// Callable function to generate a PDF for all QR codes in a batch
exports.generateBatchQrCodesPdf = https.onCall({ region: "africa-south1" }, async (request) => {
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
        const qrCodesSnapshot = await firebase_1.db.collection("qrCodes")
            .where("batchId", "==", batchId)
            .orderBy("label")
            .get();
        logger.info("Fetched QR codes snapshot", { count: qrCodesSnapshot.size });
        // Check if we found any QR codes
        if (qrCodesSnapshot.empty) {
            throw new https.HttpsError("not-found", "No QR codes found for the provided batch ID");
        }
        // Process all QR codes
        const qrCodes = [];
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
        const pdfBuffer = await (0, qrPdfGenerator_1.generateQrPdfBuffer)(qrCodes);
        logger.info("PDF generated successfully", { size: pdfBuffer.length });
        // Convert buffer to base64 for transport
        const base64Data = pdfBuffer.toString('base64');
        // Return the base64 data
        return {
            success: true,
            data: base64Data,
            message: "PDF generated successfully"
        };
    }
    catch (error) {
        logger.error("Error generating batch QR codes PDF", { error: error.message, stack: error.stack });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", `Failed to generate PDF: ${error.message}`);
    }
});
//# sourceMappingURL=generateBatchQrPdf.js.map