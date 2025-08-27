"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.onAuthStateChanged = exports.signUpWithEmailAndPassword = exports.signOut = exports.signInWithEmailAndPassword = exports.signInWithUsernameAndPassword = exports.getUserEmailByUsername = void 0;
// Authentication service for Firebase
const firebase_1 = require("./firebase"); // Import the configured auth instance
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return firebase_1.auth; } });
const firestore_1 = require("firebase/firestore");
const auth_1 = require("firebase/auth");
/**
 * Looks up a user's email by their username
 * @param username - User's username
 * @returns Promise that resolves with the user's email address or null if not found
 */
const getUserEmailByUsername = async (username) => {
    try {
        const firestore = (0, firestore_1.getFirestore)(firebase_1.app);
        const usersCollection = (0, firestore_1.collection)(firestore, 'users');
        const q = (0, firestore_1.query)(usersCollection, (0, firestore_1.where)('username', '==', username));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
        if (querySnapshot.empty) {
            return null;
        }
        const userDoc = querySnapshot.docs[0];
        // For security reasons, we can't directly get a user's email by UID from the client
        // We'll need to store the email in the user document when they sign up
        const userData = userDoc.data();
        return userData.email || null;
    }
    catch (error) {
        console.error('Error looking up user by username:', error);
        throw error;
    }
};
exports.getUserEmailByUsername = getUserEmailByUsername;
/**
 * Signs in a user with username and password
 * @param username - User's username
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 */
const signInWithUsernameAndPassword = async (username, password) => {
    try {
        // Look up the user's email by username
        const email = await (0, exports.getUserEmailByUsername)(username);
        if (!email) {
            throw new Error('User not found');
        }
        // Sign in with the retrieved email and password
        const userCredential = await (0, auth_1.signInWithEmailAndPassword)(firebase_1.auth, email, password);
        return userCredential;
    }
    catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};
exports.signInWithUsernameAndPassword = signInWithUsernameAndPassword;
/**
 * Signs in a user with email and password (deprecated - use signInWithUsernameAndPassword instead)
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 * @deprecated Use signInWithUsernameAndPassword instead
 */
const signInWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await (0, auth_1.signInWithEmailAndPassword)(firebase_1.auth, email, password);
        return userCredential;
    }
    catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
};
exports.signInWithEmailAndPassword = signInWithEmailAndPassword;
/**
 * Signs out the current user
 * @returns Promise that resolves when sign out is complete
 */
const signOut = async () => {
    try {
        await (0, auth_1.signOut)(firebase_1.auth);
    }
    catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};
exports.signOut = signOut;
/**
 * Signs up a new user with email, password, name, and username
 * @param name - User's full name
 * @param username - User's username
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 */
const signUpWithEmailAndPassword = async (name, username, email, password) => {
    try {
        // Create user with Firebase Auth
        const userCredential = await (0, auth_1.createUserWithEmailAndPassword)(firebase_1.auth, email, password);
        // Initialize Firestore
        const firestore = (0, firestore_1.getFirestore)(firebase_1.app);
        // Create user document in Firestore with name, username, email, and 'member' role
        const user = userCredential.user;
        await (0, firestore_1.setDoc)((0, firestore_1.doc)(firestore, 'users', user.uid), {
            name,
            username,
            email,
            role: 'member',
        });
        // Update the user's display name in Firebase Auth
        await (0, auth_1.updateProfile)(user, {
            displayName: name,
        });
        return userCredential;
    }
    catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};
exports.signUpWithEmailAndPassword = signUpWithEmailAndPassword;
/**
 * Observer for authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
const onAuthStateChanged = (callback) => {
    return (0, auth_1.onAuthStateChanged)(firebase_1.auth, callback);
};
exports.onAuthStateChanged = onAuthStateChanged;
