// Authentication service for Firebase
import { auth, app } from './firebase'; // Import the configured auth instance
import { getFirestore, doc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword as firebaseCreateUser,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';

/**
 * Looks up a user's email by their username
 * @param username - User's username
 * @returns Promise that resolves with the user's email address or null if not found
 */
export const getUserEmailByUsername = async (username: string): Promise<string | null> => {
  try {
    const firestore = getFirestore(app);
    const usersCollection = collection(firestore, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
  
    
    // For security reasons, we can't directly get a user's email by UID from the client
    // We'll need to store the email in the user document when they sign up
    const userData = userDoc.data();
    return userData.email || null;
  } catch (error) {
    console.error('Error looking up user by username:', error);
    throw error;
  }
};

/**
 * Signs in a user with username and password
 * @param username - User's username
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 */
export const signInWithUsernameAndPassword = async (username: string, password: string) => {
  try {
    // Look up the user's email by username
    const email = await getUserEmailByUsername(username);
    
    if (!email) {
      throw new Error('User not found');
    }
    
    // Sign in with the retrieved email and password
    const userCredential = await firebaseSignIn(auth, email, password);
    
    // Update the signedIn property in Firestore to true
    if (userCredential.user) {
      const firestore = getFirestore(app);
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      await updateDoc(userDocRef, {
        signedIn: true
      });
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Signs in a user with email and password (deprecated - use signInWithUsernameAndPassword instead)
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 * @deprecated Use signInWithUsernameAndPassword instead
 */
export const signInWithEmailAndPassword = async (email: string, password: string) => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

/**
 * Signs out the current user
 * @returns Promise that resolves when sign out is complete
 */
export const signOut = async () => {
  try {
    const currentUser = auth.currentUser;
    await firebaseSignOut(auth);
    
    // Update the signedIn property in Firestore to false
    if (currentUser) {
      const firestore = getFirestore(app);
      const userDocRef = doc(firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        signedIn: false
      });
    }
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Signs up a new user with email, password, name, and username
 * @param name - User's full name
 * @param username - User's username
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise that resolves with user credentials
 */
export const signUpWithEmailAndPassword = async (name: string, username: string, email: string, password: string) => {
  try {
    // Create user with Firebase Auth
    const userCredential = await firebaseCreateUser(auth, email, password);

    // Initialize Firestore
    const firestore = getFirestore(app);

    // Create user document in Firestore with name, username, email, and 'member' role
    const user = userCredential.user;
    await setDoc(doc(firestore, 'users', user.uid), {
      name,
      username,
      email,
      role: 'member',
      // Initialize tutorial flags for new users
      tutorialEnabled: true,
      // Initialize signedIn status
      signedIn: true,
    });

    // Update the user's display name in Firebase Auth
    await firebaseUpdateProfile(user, {
      displayName: name,
    });

    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Observer for authentication state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Updates a user's tutorial completion status
 * @param userId - The user's ID
 * @param tutorialData - The tutorial completion data to update
 * @returns Promise that resolves when the update is complete
 */
export const updateUserTutorialStatus = async (userId: string, tutorialData: {
  tutorialEnabled?: boolean;
}) => {
  try {
    const firestore = getFirestore(app);
    const userDocRef = doc(firestore, 'users', userId);
    await updateDoc(userDocRef, tutorialData);
  } catch (error) {
    console.error('Error updating user tutorial status:', error);
    throw error;
  }
};

/**
 * Marks a specific tutorial as completed for a user
 * @param userId - The user's ID
 * @param tutorialType - The type of tutorial to mark as completed
 * @returns Promise that resolves when the update is complete
 */
export const markTutorialAsCompleted = async (userId: string, tutorialType: 'sales' | 'checkout' | 'registration') => {
  try {
    // This function is now a no-op since we're not tracking individual tutorial completion states
    // The tutorialEnabled flag is managed separately
    console.log(`Tutorial ${tutorialType} marked as completed for user ${userId}`);
  } catch (error) {
    console.error(`Error marking ${tutorialType} tutorial as completed:`, error);
    throw error;
  }
};

/**
 * Marks all tutorials as completed for a user
 * @param userId - The user's ID
 * @returns Promise that resolves when the update is complete
 */
export const markAllTutorialsAsCompleted = async (userId: string) => {
  try {
    await updateUserTutorialStatus(userId, {
      tutorialEnabled: false // Disable tutorial when all are completed
    });
  } catch (error) {
    console.error('Error marking all tutorials as completed:', error);
    throw error;
  }
};

/**
 * Resets a user's tutorial progress
 * @param userId - The user's ID
 * @returns Promise that resolves when the reset is complete
 */
export const resetUserTutorial = async (userId: string) => {
  try {
    await updateUserTutorialStatus(userId, {
      tutorialEnabled: true // Re-enable tutorial
    });
  } catch (error) {
    console.error('Error resetting user tutorial:', error);
    throw error;
  }
};

// Export the auth instance for direct access if needed
export { auth };
export type { User };