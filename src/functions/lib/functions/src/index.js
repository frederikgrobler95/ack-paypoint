"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
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
exports.generateQrCodesPdf = void 0;
const firebase_functions_1 = require("firebase-functions");
const https_1 = require("firebase-functions/https");
const logger = __importStar(require("firebase-functions/logger"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const qrPdfGenerator_1 = require("./qrPdfGenerator");
// Initialize Firebase Admin SDK
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
(0, firebase_functions_1.setGlobalOptions)({ maxInstances: 10 });
// Function to generate QR code PDF
exports.generateQrCodesPdf = (0, https_1.onRequest)({ cors: true }, async (request, response) => {
    logger.info("Generate QR codes PDF function started", { structuredData: true });
    try {
        // Check if request method is POST
        if (request.method !== "POST") {
            response.status(405).send("Method Not Allowed");
            return;
        }
        // Get QR code IDs from request body
        const { qrCodeIds } = request.body;
        // Validate input
        if (!qrCodeIds || !Array.isArray(qrCodeIds) || qrCodeIds.length === 0) {
            response.status(400).send("Invalid request: qrCodeIds array is required");
            return;
        }
        // Limit the number of QR codes that can be generated at once
        if (qrCodeIds.length > 500) {
            response.status(400).send("Too many QR codes requested. Maximum is 500.");
            return;
        }
        // Fetch QR codes from Firestore
        const qrCodes = [];
        const batchPromises = [];
        // Process in batches of 10 to avoid Firestore limits
        for (let i = 0; i < qrCodeIds.length; i += 10) {
            const batch = qrCodeIds.slice(i, i + 10);
            batchPromises.push(Promise.all(batch.map(async (id) => {
                const doc = await db.collection("qrCodes").doc(id).get();
                if (doc.exists) {
                    const data = doc.data();
                    if (data) {
                        qrCodes.push({
                            id: doc.id,
                            label: data.label,
                            status: data.status,
                            assignedCustomerId: data.assignedCustomerId,
                            createdAt: data.createdAt,
                            updatedAt: data.updatedAt
                        });
                    }
                }
            })));
        }
        // Wait for all batches to complete
        await Promise.all(batchPromises);
        // Check if we found any QR codes
        if (qrCodes.length === 0) {
            response.status(404).send("No QR codes found for the provided IDs");
            return;
        }
        // Generate PDF
        const pdfBuffer = await (0, qrPdfGenerator_1.generateQrPdfBuffer)(qrCodes);
        // Set response headers
        response.setHeader("Content-Type", "application/pdf");
        response.setHeader("Content-Disposition", `attachment; filename="basaar-qr-codes-${new Date().toISOString().split('T')[0]}.pdf"`);
        // Send PDF buffer as response
        response.status(200).send(pdfBuffer);
    }
    catch (error) {
        logger.error("Error generating QR codes PDF", { error, structuredData: true });
        response.status(500).send("Internal Server Error");
    }
});
//# sourceMappingURL=index.js.map