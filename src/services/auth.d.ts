import { auth } from './firebase';
import type { User } from 'firebase/auth';
/**
 * Looks up a user's email by their username
 * @param username - User's username
 * @returns Promise that resolves with the user's email address or null if not found
 */
export declare const getUserEmailByUsername: (username: string) => Promise<string | null>;
/**
 * Signs in a user with username and password
 * @param username - User's username
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 */
export declare const signInWithUsernameAndPassword: (username: string, password: string) => Promise<import("@firebase/auth").UserCredential>;
/**
 * Signs in a user with email and password (deprecated - use signInWithUsernameAndPassword instead)
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 * @deprecated Use signInWithUsernameAndPassword instead
 */
export declare const signInWithEmailAndPassword: (email: string, password: string) => Promise<import("@firebase/auth").UserCredential>;
/**
 * Signs out the current user
 * @returns Promise that resolves when sign out is complete
 */
export declare const signOut: () => Promise<void>;
/**
 * Signs up a new user with email, password, name, and username
 * @param name - User's full name
 * @param username - User's username
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 */
export declare const signUpWithEmailAndPassword: (name: string, username: string, email: string, password: string) => Promise<import("@firebase/auth").UserCredential>;
/**
 * Observer for authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export declare const onAuthStateChanged: (callback: (user: User | null) => void) => import("@firebase/util").Unsubscribe;
export { auth };
export type { User };
