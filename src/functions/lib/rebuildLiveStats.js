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
exports.rebuildLiveStats = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const firestore_1 = require("firebase-admin/firestore");
const firebase_1 = require("./firebase");
const logger = __importStar(require("firebase-functions/logger"));
const statsCalculations_1 = require("./statsCalculations");
const statsDocRef = firebase_1.db.doc('stats/live');
exports.rebuildLiveStats = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https.HttpsError('unauthenticated', 'User is not authenticated.');
    }
    // Optional: Add role check to ensure only admins can run this.
    // const userDoc = await db.collection('users').doc(uid).get();
    // if (userDoc.data()?.role !== 'admin') {
    //   throw new https.HttpsError('permission-denied', 'User is not an admin.');
    // }
    logger.info('Starting live stats rebuild...');
    try {
        // Calculate total sales and top stall
        const transactionsSnapshot = await firebase_1.db.collection("transactions").get();
        const { totalSales, topStallInfo } = await (0, statsCalculations_1.calculateSalesStats)(transactionsSnapshot);
        // Calculate total checkout amount
        const paymentsSnapshot = await firebase_1.db.collection("payments").get();
        const totalCheckoutAmount = paymentsSnapshot.docs.reduce((sum, doc) => sum + doc.data().amountCents, 0);
        // Count total customers
        const customersSnapshot = await firebase_1.db.collection('customers').get();
        const totalCustomers = customersSnapshot.size;
        // Update the stats document
        await statsDocRef.set({
            totalSales,
            topPerformingStall: topStallInfo,
            totalCheckoutAmount,
            totalCustomers,
            lastUpdated: firestore_1.FieldValue.serverTimestamp(),
        });
        logger.info('Live stats rebuild completed successfully.');
        return { status: 'success' };
    }
    catch (error) {
        logger.error('Error rebuilding live stats:', {
            error: error.message,
            stack: error.stack,
        });
        throw new https.HttpsError('internal', 'An internal error occurred while rebuilding stats.');
    }
});
//# sourceMappingURL=rebuildLiveStats.js.map