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
exports.processRefund = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
exports.processRefund = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    const { accountId, amountCents, refundOfTxnId, idempotencyKey, operatorName } = request.data;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https.HttpsError("unauthenticated", "User is not authenticated.");
    }
    if (!accountId || !amountCents || !refundOfTxnId || !idempotencyKey) {
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
            const accountDocRef = firebase_1.db.collection("accounts").doc(accountId);
            const accountDoc = await transaction.get(accountDocRef);
            if (!accountDoc.exists) {
                throw new https.HttpsError("not-found", `Account ${accountId} not found.`);
            }
            const accountData = accountDoc.data();
            if (!accountData) {
                throw new https.HttpsError("internal", `Account ${accountId} data is missing.`);
            }
            const originalTxnDocRef = firebase_1.db.collection("transactions").doc(refundOfTxnId);
            const originalTxnDoc = await transaction.get(originalTxnDocRef);
            if (!originalTxnDoc.exists) {
                throw new https.HttpsError("not-found", `Original transaction ${refundOfTxnId} not found.`);
            }
            const originalTxnData = originalTxnDoc.data();
            if (!originalTxnData) {
                throw new https.HttpsError("internal", `Original transaction ${refundOfTxnId} data is missing.`);
            }
            if (originalTxnData.accountId !== accountId) {
                throw new https.HttpsError("failed-precondition", "Transaction does not belong to this account.");
            }
            if (originalTxnData.type !== "debit") {
                throw new https.HttpsError("failed-precondition", "Can only refund debit transactions.");
            }
            const assignmentDocRef = firebase_1.db.collection("assignments").doc(uid);
            const assignmentDoc = await transaction.get(assignmentDocRef);
            if (!assignmentDoc.exists) {
                throw new https.HttpsError("failed-precondition", `User ${uid} is not assigned to a stall.`);
            }
            const stallId = (_a = assignmentDoc.data()) === null || _a === void 0 ? void 0 : _a.stallId;
            if (originalTxnData.stallId !== stallId) {
                throw new https.HttpsError("failed-precondition", "Cannot refund transactions from a different stall.");
            }
            const refundsQuery = firebase_1.db.collection("transactions").where("refundOfTxnId", "==", refundOfTxnId);
            const refundsSnapshot = await transaction.get(refundsQuery);
            const totalRefundedCents = refundsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amountCents, 0);
            const remainingRefundableCents = originalTxnData.amountCents - totalRefundedCents;
            if (amountCents > remainingRefundableCents) {
                throw new https.HttpsError("failed-precondition", `Refund amount exceeds remaining balance. Maximum refund: ${remainingRefundableCents / 100}`);
            }
            const refundData = {
                accountId,
                stallId,
                operatorId: uid,
                operatorName: operatorName || "Unknown Operator",
                amountCents,
                type: "refund",
                refundOfTxnId,
                idempotencyKey,
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            };
            const refundDocRef = firebase_1.db.collection("transactions").doc();
            transaction.set(refundDocRef, refundData);
            const newBalanceCents = accountData.balanceCents - amountCents;
            transaction.update(accountDocRef, {
                balanceCents: newBalanceCents,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            transaction.set(idemDocRef, { createdAt: firestore_1.FieldValue.serverTimestamp() });
            return { status: "success", refundId: refundDocRef.id };
        });
        return result;
    }
    catch (error) {
        logger.error("Error processing refund", {
            error: error.message,
            code: error.code || 'unknown',
            stack: error.stack,
            accountId,
            refundOfTxnId,
            uid,
            timestamp: new Date().toISOString()
        });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", "An internal error occurred while processing the refund.");
    }
});
//# sourceMappingURL=processRefund.js.map