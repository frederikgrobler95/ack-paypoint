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
exports.createAdminCustomers = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
// Helper function to generate unique QR code labels
const generateUniqueQrCodeLabel = async () => {
    const label = `BASAAR-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const qrCodeDoc = await firebase_1.db.collection("qrCodes").where("label", "==", label).limit(1).get();
    if (qrCodeDoc.empty) {
        return label;
    }
    // If label exists, generate a new one recursively
    return generateUniqueQrCodeLabel();
};
// Helper function to create a customer with QR code
const createCustomerWithQrCode = async (transaction, customerData, batchId) => {
    // Generate a unique QR code for this customer
    const qrCodeLabel = await generateUniqueQrCodeLabel();
    // Create QR code document
    const qrCodeData = {
        label: qrCodeLabel,
        status: "assigned",
        assignedCustomerId: null, // Will be updated after customer creation
        batchId: batchId,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    const qrCodeDocRef = firebase_1.db.collection("qrCodes").doc(qrCodeLabel);
    transaction.set(qrCodeDocRef, qrCodeData);
    // Create customer document
    const customerDataWithQr = Object.assign(Object.assign({}, customerData), { qrCodeId: qrCodeLabel, createdAt: firestore_1.FieldValue.serverTimestamp() });
    const customerDocRef = firebase_1.db.collection("customers").doc();
    transaction.set(customerDocRef, customerDataWithQr);
    // Update QR code with assigned customer ID
    transaction.update(qrCodeDocRef, {
        assignedCustomerId: customerDocRef.id,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    // Create account document
    const accountData = {
        customerId: customerDocRef.id,
        balanceCents: 0,
        status: "unpaid",
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    };
    const accountDocRef = firebase_1.db.collection("accounts").doc();
    transaction.set(accountDocRef, accountData);
    return {
        customerId: customerDocRef.id,
        qrCodeId: qrCodeLabel,
        accountId: accountDocRef.id,
    };
};
exports.createAdminCustomers = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    const { customers, batchName } = request.data;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https.HttpsError("unauthenticated", "User is not authenticated.");
    }
    // Check if user is admin
    const userDoc = await firebase_1.db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    if (!userDoc.exists || (userData === null || userData === void 0 ? void 0 : userData.role) !== "admin") {
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
        const result = await firebase_1.db.runTransaction(async (transaction) => {
            // Check if a batch with the same name already exists
            const existingBatchQuery = await firebase_1.db.collection("qrBatches")
                .where("batchName", "==", batchName)
                .limit(1)
                .get();
            let batchId;
            let batchDocRef;
            if (!existingBatchQuery.empty) {
                // Use existing batch
                const existingBatch = existingBatchQuery.docs[0];
                batchId = existingBatch.id;
                batchDocRef = existingBatch.ref;
                // Update the existing batch count by adding the new customers
                const existingBatchData = existingBatch.data();
                const currentCount = (existingBatchData === null || existingBatchData === void 0 ? void 0 : existingBatchData.count) || 0;
                transaction.update(batchDocRef, {
                    count: currentCount + customers.length,
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                });
            }
            else {
                // Create a new batch document
                const batchData = {
                    batchName,
                    generatedBy: uid,
                    count: customers.length,
                    createdAt: firestore_1.FieldValue.serverTimestamp(),
                };
                batchDocRef = firebase_1.db.collection("qrBatches").doc();
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
                createdCustomers.push(Object.assign(Object.assign({}, customer), createdCustomer));
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
    }
    catch (error) {
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
//# sourceMappingURL=createAdminCustomers.js.map