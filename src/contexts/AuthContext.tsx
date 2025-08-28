import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithUsernameAndPassword, signUpWithEmailAndPassword, signOut } from '../services/auth';
import { User } from 'firebase/auth';
import { useSessionStore } from '../shared/stores/sessionStore';
import { doc, getDoc, getFirestore, updateDoc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  role: 'admin' | 'member' | null;
  loading: boolean;
  tutorialEnabled: boolean;
  setTutorialEnabled: (enabled: boolean) => Promise<void>;
  setTutorialCompleted: (completed: boolean) => Promise<void>;
  signin: (username: string, password: string) => Promise<void>;
  signup: (name: string, username: string, email: string, password: string) => Promise<void>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'member' | null>(null);
  const [tutorialEnabled, setTutorialEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [userDocUnsubscribe, setUserDocUnsubscribe] = useState<(() => void) | null>(null);
  const sessionStore = useSessionStore();

  useEffect(() => {
    console.log('AuthContext: useEffect triggered');
    const unsubscribe = onAuthStateChanged(async (user) => {
      console.log('AuthContext: onAuthStateChanged callback triggered', user);
      setCurrentUser(user);
      sessionStore.setUser(user);

      if (user) {
        // Fetch user role from Firestore
        try {
          const firestore = getFirestore(app);
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.role || 'member';
            const userTutorialEnabled = userData.tutorialEnabled !== undefined ? userData.tutorialEnabled : true;
            setRole(userRole);
            setTutorialEnabled(userTutorialEnabled);
            sessionStore.setRole(userRole);
            sessionStore.setDisplayName(userData.name || user.displayName);
            sessionStore.setSignedIn(true);
            
            // Set up real-time listener for user document changes
            if (userDocUnsubscribe) {
              userDocUnsubscribe();
            }
            const unsubscribe = onSnapshot(doc(firestore, 'users', user.uid), (doc) => {
              if (doc.exists()) {
                const userData = doc.data();
                // Check if signedIn property changed to false
                if (userData.signedIn === false) {
                  // Automatically sign out the user
                  handleAutoSignOut();
                }
              }
            });
            setUserDocUnsubscribe(() => unsubscribe);
          } else {
            // Default values for new users
            setRole('member');
            setTutorialEnabled(true);
            sessionStore.setRole('member');
            sessionStore.setDisplayName(user.displayName);
            sessionStore.setSignedIn(true);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole('member');
          setTutorialEnabled(true);
          sessionStore.setRole('member');
          sessionStore.setDisplayName(user.displayName);
          sessionStore.setSignedIn(true);
        }
      } else {
        setRole(null);
        setTutorialEnabled(false);
        sessionStore.clearSession();
        sessionStore.setSignedIn(false);
        
        // Unsubscribe from user document listener if it exists
        if (userDocUnsubscribe) {
          userDocUnsubscribe();
          setUserDocUnsubscribe(null);
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      // Clean up user document listener if it exists
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []); // Remove sessionStore from dependencies to prevent re-runs

  const signin = async (username: string, password: string) => {
    try {
      await signInWithUsernameAndPassword(username, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signup = async (name: string, username: string, email: string, password: string) => {
    try {
      await signUpWithEmailAndPassword(name, username, email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const updateTutorialEnabled = async (enabled: boolean) => {
    if (currentUser) {
      try {
        const firestore = getFirestore(app);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          tutorialEnabled: enabled
        });
        // Update local state
        setTutorialEnabled(enabled);
      } catch (error) {
        console.error('Error updating tutorial enabled status:', error);
        throw error;
      }
    }
  };

  const setTutorialCompleted = async (completed: boolean) => {
    if (currentUser) {
      try {
        const firestore = getFirestore(app);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          tutorialEnabled: false // Disable tutorial when completed
        });
        // Update local state
        setTutorialEnabled(false);
      } catch (error) {
        console.error('Error updating tutorial completed status:', error);
        throw error;
      }
    }
  };


  const signout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setRole(null);
      setTutorialEnabled(false);
      sessionStore.clearSession();
      sessionStore.setSignedIn(false);
      
      // Unsubscribe from user document listener if it exists
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        setUserDocUnsubscribe(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };
  
  const handleAutoSignOut = async () => {
    try {
      console.log('Auto-signing out user due to database change');
      await signOut();
      setCurrentUser(null);
      setRole(null);
      setTutorialEnabled(false);
      sessionStore.clearSession();
      sessionStore.setSignedIn(false);
      
      // Unsubscribe from user document listener
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
        setUserDocUnsubscribe(null);
      }
    } catch (error) {
      console.error('Auto sign out error:', error);
    }
  };

  const value = {
    currentUser,
    role,
    loading,
    tutorialEnabled,
    setTutorialEnabled: updateTutorialEnabled,
    setTutorialCompleted,
    signin,
    signup,
    signout
  };

  console.log('AuthContext: rendering with loading state:', loading);
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};