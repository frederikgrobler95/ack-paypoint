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
exports.processCheckout = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
exports.processCheckout = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    const { qrCodeId, paymentMethod, amountCents, idempotencyKey, operatorName } = request.data;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https.HttpsError("unauthenticated", "User is not authenticated.");
    }
    if (!qrCodeId || !paymentMethod || !amountCents || !idempotencyKey) {
        throw new https.HttpsError("invalid-argument", "Missing required parameters.");
    }
    try {
        const result = await firebase_1.db.runTransaction(async (transaction) => {
            var _a;
            const idemDocRef = firebase_1.db.collection("_idem").doc(idempotencyKey);
            const idemDoc = await transaction.get(idemDocRef);
            if (idemDoc.exists) {
                return { status: "already-processed" };
            }
            const qrCodesQuery = firebase_1.db.collection("qrCodes").where("label", "==", qrCodeId).limit(1);
            const qrCodesSnapshot = await transaction.get(qrCodesQuery);
            if (qrCodesSnapshot.empty) {
                throw new https.HttpsError("not-found", `QR code ${qrCodeId} not found.`);
            }
            const customersQuery = firebase_1.db.collection("customers").where("qrCodeId", "==", qrCodeId).limit(1);
            const customersSnapshot = await transaction.get(customersQuery);
            if (customersSnapshot.empty) {
                throw new https.HttpsError("not-found", `No customer found for QR code ${qrCodeId}.`);
            }
            const customerId = customersSnapshot.docs[0].id;
            const accountsQuery = firebase_1.db.collection("accounts").where("customerId", "==", customerId).limit(1);
            const accountsSnapshot = await transaction.get(accountsQuery);
            if (accountsSnapshot.empty) {
                throw new https.HttpsError("not-found", `No account found for customer ${customerId}.`);
            }
            const accountDoc = accountsSnapshot.docs[0];
            const accountData = accountDoc.data();
            if (!accountData) {
                throw new https.HttpsError("internal", `Account ${accountDoc.id} data is missing.`);
            }
            if (accountData.status === "paid") {
                throw new https.HttpsError("failed-precondition", "Account is already paid.");
            }
            if (accountData.balanceCents !== amountCents) {
                throw new https.HttpsError("failed-precondition", `Amount ${amountCents} does not match account balance ${accountData.balanceCents}.`);
            }
            const assignmentDocRef = firebase_1.db.collection("assignments").doc(uid);
            const assignmentDoc = await transaction.get(assignmentDocRef);
            if (!assignmentDoc.exists) {
                throw new https.HttpsError("failed-precondition", `User ${uid} is not assigned to a stall.`);
            }
            const stallId = (_a = assignmentDoc.data()) === null || _a === void 0 ? void 0 : _a.stallId;
            const paymentData = {
                accountId: accountDoc.id,
                method: paymentMethod,
                amountCents,
                operatorId: uid,
                operatorName: operatorName || "Unknown Operator",
                idempotencyKey,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const paymentDocRef = firebase_1.db.collection("payments").doc();
            transaction.set(paymentDocRef, paymentData);
            transaction.update(accountDoc.ref, {
                status: "paid",
                balanceCents: 0,
                lastPaidAt: firestore_1.FieldValue.serverTimestamp(),
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            const creditTransactionData = {
                accountId: accountDoc.id,
                stallId,
                operatorId: uid,
                operatorName: operatorName || "Unknown Operator",
                amountCents,
                type: "credit",
                idempotencyKey: `txn-${idempotencyKey}`,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const transactionDocRef = firebase_1.db.collection("transactions").doc();
            transaction.set(transactionDocRef, creditTransactionData);
            transaction.set(idemDocRef, { createdAt: firestore_1.FieldValue.serverTimestamp() });
            return { status: "success", paymentId: paymentDocRef.id };
        });
        return result;
    }
    catch (error) {
        logger.error("Error processing checkout", {
            error: error.message,
            code: error.code || 'unknown',
            stack: error.stack,
            qrCodeId,
            paymentMethod,
            uid,
            timestamp: new Date().toISOString()
        });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", "An internal error occurred while processing the checkout.");
    }
});
//# sourceMappingURL=processCheckout.js.map