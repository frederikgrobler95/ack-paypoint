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
exports.generateQrBatch = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("./firebase");
const firestore_1 = require("firebase-admin/firestore");
// Helper function to generate unique QR code labels
const generateUniqueRandomCode = async () => {
    const code = `BASAAR-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const snapshot = await firebase_1.db.collection('qrCodes').where('label', '==', code).get();
    if (snapshot.empty) {
        return code;
    }
    return generateUniqueRandomCode();
};
// Callable function to generate a batch of QR codes
exports.generateQrBatch = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    logger.info("Generate QR batch callable function started", { structuredData: true });
    try {
        // Get parameters from request data
        const { count, batchName } = request.data;
        const userId = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
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
        const existingBatchSnapshot = await firebase_1.db.collection('qrBatches')
            .where('batchName', '==', batchName)
            .get();
        let batchId;
        let batchData;
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
            await firebase_1.db.collection('qrBatches').doc(batchId).update({ count: batchData.count });
            logger.info("Updated existing batch", { batchId, newCount: batchData.count });
        }
        else {
            // Create a new batch document
            batchData = {
                batchName,
                generatedBy: userId,
                count,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const batchDocRef = await firebase_1.db.collection('qrBatches').add(batchData);
            batchId = batchDocRef.id;
            logger.info("Created new batch", { batchId });
        }
        // Generate QR codes
        const codes = [];
        const batch = firebase_1.db.batch();
        for (let i = 0; i < count; i++) {
            const label = await generateUniqueRandomCode();
            const qrCodeData = {
                label,
                status: 'unassigned',
                assignedCustomerId: null,
                batchId: batchId,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const qrCodeDocRef = firebase_1.db.collection('qrCodes').doc(label);
            batch.set(qrCodeDocRef, qrCodeData);
            codes.push(Object.assign({ id: label }, qrCodeData));
        }
        // Commit the batch
        await batch.commit();
        logger.info("Generated QR codes", { count: codes.length, batchId });
        // Return success response
        return {
            success: true,
            batch: Object.assign({ id: batchId }, batchData),
            codes
        };
    }
    catch (error) {
        logger.error("Error generating QR batch", { error: error.message, stack: error.stack });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", `Failed to generate QR batch: ${error.message}`);
    }
});
//# sourceMappingURL=generateQrBatch.js.map