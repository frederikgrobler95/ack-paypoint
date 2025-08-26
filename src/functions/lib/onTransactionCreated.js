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
exports.onTransactionCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const logger = __importStar(require("firebase-functions/logger"));
const statsDocRef = firebase_1.db.doc('stats/live');
exports.onTransactionCreated = (0, firestore_1.onDocumentCreated)({ document: 'transactions/{transactionId}', region: 'africa-south1' }, (event) => {
    const snap = event.data;
    if (!snap) {
        logger.error('No data associated with the event', { event });
        return null;
    }
    const transaction = snap.data();
    // Only process debit and refund transactions for sales stats
    if (transaction.type !== 'debit' && transaction.type !== 'refund') {
        return null;
    }
    const amount = transaction.type === 'refund'
        ? -transaction.amountCents
        : transaction.amountCents;
    return statsDocRef.set({
        totalSales: firestore_2.FieldValue.increment(amount),
        lastUpdated: firestore_2.FieldValue.serverTimestamp(),
    }, { merge: true });
});
//# sourceMappingURL=onTransactionCreated.js.map