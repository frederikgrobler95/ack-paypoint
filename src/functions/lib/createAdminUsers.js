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
exports.createAdminUsers = void 0;
const https = __importStar(require("firebase-functions/v2/https"));
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const firebase_1 = require("./firebase");
// interface UserData {
//   name: string;
//   username: string;
//   email: string;
//   password: string;
//   role: 'admin' | 'member';
// }
exports.createAdminUsers = https.onCall({ region: "africa-south1" }, async (request) => {
    var _a;
    const { users } = request.data;
    // const batchName is not used but kept for compatibility
    const uid = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!uid) {
        throw new https.HttpsError("unauthenticated", "User is not authenticated.");
    }
    // Check if user is admin
    const userDoc = await firebase_1.db.collection("users").doc(uid).get();
    const userData = userDoc.data();
    if (!userDoc.exists || (userData === null || userData === void 0 ? void 0 : userData.role) !== "admin") {
        throw new https.HttpsError("permission-denied", "Only administrators can create users.");
    }
    // Basic validation
    if (!users || !Array.isArray(users) || users.length === 0) {
        throw new https.HttpsError("invalid-argument", "Users array is required and cannot be empty.");
    }
    try {
        const createdUsers = [];
        for (const user of users) {
            // Validate user data
            if (!user.name || !user.username || !user.email || !user.password || !user.role) {
                throw new https.HttpsError("invalid-argument", "Each user must have name, username, email, password, and role.");
            }
            // Create Firebase Auth user
            const authUser = await admin.auth().createUser({
                email: user.email,
                displayName: user.name,
                emailVerified: false,
                password: user.password
            });
            // Create user document in Firestore
            const userDocData = {
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            };
            await firebase_1.db.collection("users").doc(authUser.uid).set(userDocData);
            createdUsers.push(Object.assign({ id: authUser.uid }, userDocData));
        }
        logger.info("Admin users created successfully", {
            count: createdUsers.length,
            uid
        });
        return {
            status: "success",
            users: createdUsers,
            count: createdUsers.length,
        };
    }
    catch (error) {
        logger.error("Error creating admin users", {
            error: error.message,
            code: error.code || 'unknown',
            stack: error.stack,
            uid,
            timestamp: new Date().toISOString()
        });
        if (error instanceof https.HttpsError) {
            throw error;
        }
        throw new https.HttpsError("internal", "An internal error occurred while creating users.");
    }
});
//# sourceMappingURL=createAdminUsers.js.map