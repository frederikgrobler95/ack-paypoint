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
exports.updateTopStall = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const firebase_1 = require("./firebase");
const statsCalculations_1 = require("./statsCalculations");
const statsDocRef = firebase_1.db.doc("stats/live");
exports.updateTopStall = https.onCall({ region: "africa-south1" }, async (request) => {
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
    logger.info("Starting manual top stall update...");
    try {
        const transactionsSnapshot = await firebase_1.db.collection("transactions").get();
        logger.info(`Found ${transactionsSnapshot.size} transactions.`);
        const { topStallInfo } = await (0, statsCalculations_1.calculateSalesStats)(transactionsSnapshot);
        logger.info("Calculated top stall info:", { topStallInfo });
        await statsDocRef.set({
            topPerformingStall: topStallInfo,
        }, { merge: true });
        logger.info("Manual top stall update completed successfully.");
        return { status: 'success' };
    }
    catch (error) {
        logger.error("Error in manual top stall update:", {
            error: error.message,
            stack: error.stack,
        });
        throw new https.HttpsError('internal', 'An internal error occurred while updating top stall info.');
    }
});
//# sourceMappingURL=updateTopStall.js.map