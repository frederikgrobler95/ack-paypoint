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
exports.processSale = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
exports.processSale = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    const { qrCodeId, amountCents, idempotencyKey, stallId, operatorName } = request.data;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https.HttpsError("unauthenticated", "User is not authenticated.");
    }
    // Basic validation
    if (!qrCodeId || !amountCents || !idempotencyKey || !stallId) {
        throw new https.HttpsError("invalid-argument", "Missing required parameters.");
    }
    try {
        const result = await firebase_1.db.runTransaction(async (transaction) => {
            const idemDocRef = firebase_1.db.collection("_idem").doc(idempotencyKey);
            const idemDoc = await transaction.get(idemDocRef);
            if (idemDoc.exists) {
                logger.info("Idempotent request already processed", { idempotencyKey });
                return { status: "already-processed" };
            }
            // Find customer by QR code
            const customersQuery = firebase_1.db.collection("customers").where("qrCodeId", "==", qrCodeId).limit(1);
            const customersSnapshot = await transaction.get(customersQuery);
            if (customersSnapshot.empty) {
                throw new https.HttpsError("not-found", `No customer found for QR code ${qrCodeId}.`);
            }
            const customerDoc = customersSnapshot.docs[0];
            const customerId = customerDoc.id;
            const customerData = customerDoc.data();
            if (!customerData || customerData.qrCodeId !== qrCodeId) {
                throw new https.HttpsError("not-found", `Customer data is invalid for QR code ${qrCodeId}.`);
            }
            // Validate operator's assignment
            const assignmentDocRef = firebase_1.db.collection("assignments").doc(uid);
            const assignmentDoc = await transaction.get(assignmentDocRef);
            if (!assignmentDoc.exists) {
                throw new https.HttpsError("failed-precondition", `User ${uid} is not assigned to any stall.`);
            }
            const assignmentData = assignmentDoc.data();
            if ((assignmentData === null || assignmentData === void 0 ? void 0 : assignmentData.stallId) !== stallId) {
                throw new https.HttpsError("failed-precondition", `User is assigned to stall ${assignmentData === null || assignmentData === void 0 ? void 0 : assignmentData.stallId}, not ${stallId}.`);
            }
            // Find account
            const accountsQuery = firebase_1.db.collection("accounts")
                .where("customerId", "==", customerId)
                .limit(1);
            const accountsSnapshot = await transaction.get(accountsQuery);
            if (accountsSnapshot.empty) {
                throw new https.HttpsError("not-found", `No account found for customer ${customerId}.`);
            }
            const accountDoc = accountsSnapshot.docs[0];
            const accountData = accountDoc.data();
            if (!accountData) {
                throw new https.HttpsError("internal", "Account data is missing.");
            }
            // Create transaction
            const transactionData = {
                accountId: accountDoc.id,
                stallId,
                operatorId: uid,
                operatorName: operatorName || "Unknown Operator",
                amountCents,
                type: "debit",
                idempotencyKey,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const transactionDocRef = firebase_1.db.collection("transactions").doc();
            transaction.set(transactionDocRef, transactionData);
            // Update account balance
            const newBalanceCents = (accountData.balanceCents || 0) + amountCents;
            const accountUpdates = {
                balanceCents: newBalanceCents,
                status: "unpaid",
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            };
            transaction.update(accountDoc.ref, accountUpdates);
            // Mark idempotency
            transaction.set(idemDocRef, {
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                originalTransactionId: transactionDocRef.id
            });
            return {
                status: "success",
                transactionId: transactionDocRef.id,
                customerId,
                accountId: accountDoc.id,
                newBalance: newBalanceCents,
            };
        });
        return result;
    }
    catch (error) {
        logger.error("Error processing sale", {
            error: error.message,
            code: error.code || 'unknown',
            stack: error.stack,
            qrCodeId,
            stallId,
            uid,
            timestamp: new Date().toISOString()
        });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", "An internal error occurred while processing the sale.");
    }
});
//# sourceMappingURL=processSale.js.map