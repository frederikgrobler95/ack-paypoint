// Firebase configuration and initialization
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

// Firebase configuration with fallback values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDAEcZbEDbNkoqryDZJbgJCFhh2PBrkNTQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pay-point-55264.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pay-point-55264",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pay-point-55264.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1064755355187",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1064755355187:web:48dd9241dab084bc438d46",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-J36D6TN6RM"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const firestore = getFirestore(app)
export const functions = getFunctions(app)

// For local development with Firebase Functions emulator
if (import.meta.env?.DEV) {
  // Uncomment the following line when using the Functions emulator
  // connectFunctionsEmulator(functions, 'localhost', 5001)
}