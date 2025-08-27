"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.functions = exports.firestore = exports.auth = exports.app = void 0;
// Firebase configuration and initialization
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const functions_1 = require("firebase/functions");
// Firebase configuration with fallback values
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDAEcZbEDbNkoqryDZJbgJCFhh2PBrkNTQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pay-point-55264.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pay-point-55264",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pay-point-55264.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1064755355187",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1064755355187:web:48dd9241dab084bc438d46",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J36D6TN6RM"
};
// Initialize Firebase
exports.app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase services
exports.auth = (0, auth_1.getAuth)(exports.app);
exports.firestore = (0, firestore_1.getFirestore)(exports.app);
exports.functions = (0, functions_1.getFunctions)(exports.app);
// For local development with Firebase Functions emulator
if ((_a = import.meta.env) === null || _a === void 0 ? void 0 : _a.DEV) {
    // Uncomment the following line when using the Functions emulator
    // connectFunctionsEmulator(functions, 'localhost', 5001)
}
