import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithUsernameAndPassword, signUpWithEmailAndPassword, signOut } from '../services/auth';
import { User } from 'firebase/auth';
import { useSessionStore } from '../shared/stores/sessionStore';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  role: 'admin' | 'member' | null;
  loading: boolean;
  tutorialEnabled: boolean;
  tutorialCompleted: boolean;
  salesTutorialCompleted: boolean;
  checkoutTutorialCompleted: boolean;
  registrationTutorialCompleted: boolean;
  setTutorialEnabled: (enabled: boolean) => Promise<void>;
  setTutorialCompleted: (completed: boolean) => Promise<void>;
  setSalesTutorialCompleted: (completed: boolean) => Promise<void>;
  setCheckoutTutorialCompleted: (completed: boolean) => Promise<void>;
  setRegistrationTutorialCompleted: (completed: boolean) => Promise<void>;
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
  const [tutorialCompleted, setTutorialCompletedState] = useState<boolean>(false);
  const [salesTutorialCompleted, setSalesTutorialCompletedState] = useState<boolean>(false);
  const [checkoutTutorialCompleted, setCheckoutTutorialCompletedState] = useState<boolean>(false);
  const [registrationTutorialCompleted, setRegistrationTutorialCompletedState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
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
            const userTutorialCompleted = userData.tutorialCompleted || false;
            const userSalesTutorialCompleted = userData.salesTutorialCompleted || false;
            const userCheckoutTutorialCompleted = userData.checkoutTutorialCompleted || false;
            const userRegistrationTutorialCompleted = userData.registrationTutorialCompleted || false;
            setRole(userRole);
            setTutorialEnabled(userTutorialEnabled);
            setTutorialCompletedState(userTutorialCompleted);
            setSalesTutorialCompletedState(userSalesTutorialCompleted);
            setCheckoutTutorialCompletedState(userCheckoutTutorialCompleted);
            setRegistrationTutorialCompletedState(userRegistrationTutorialCompleted);
            sessionStore.setRole(userRole);
            sessionStore.setDisplayName(userData.name || user.displayName);
          } else {
            // Default values for new users
            setRole('member');
            setTutorialEnabled(true);
            setTutorialCompletedState(false);
            setSalesTutorialCompletedState(false);
            setCheckoutTutorialCompletedState(false);
            setRegistrationTutorialCompletedState(false);
            sessionStore.setRole('member');
            sessionStore.setDisplayName(user.displayName);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole('member');
          setTutorialEnabled(true);
          setTutorialCompletedState(false);
          setSalesTutorialCompletedState(false);
          setCheckoutTutorialCompletedState(false);
          setRegistrationTutorialCompletedState(false);
          sessionStore.setRole('member');
          sessionStore.setDisplayName(user.displayName);
        }
      } else {
        setRole(null);
        setTutorialEnabled(false);
        setTutorialCompletedState(false);
        setSalesTutorialCompletedState(false);
        setCheckoutTutorialCompletedState(false);
        setRegistrationTutorialCompletedState(false);
        sessionStore.clearSession();
      }

      setLoading(false);
    });

    return unsubscribe;
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
          tutorialCompleted: completed,
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

  const setSalesTutorialCompleted = async (completed: boolean) => {
    if (currentUser) {
      try {
        const firestore = getFirestore(app);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          salesTutorialCompleted: completed
        });
        // Update local state
        setSalesTutorialCompletedState(completed);
      } catch (error) {
        console.error('Error updating sales tutorial completed status:', error);
        throw error;
      }
    }
  };

  const setCheckoutTutorialCompleted = async (completed: boolean) => {
    if (currentUser) {
      try {
        const firestore = getFirestore(app);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          checkoutTutorialCompleted: completed
        });
        // Update local state
        setCheckoutTutorialCompletedState(completed);
      } catch (error) {
        console.error('Error updating checkout tutorial completed status:', error);
        throw error;
      }
    }
  };

  const setRegistrationTutorialCompleted = async (completed: boolean) => {
    if (currentUser) {
      try {
        const firestore = getFirestore(app);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          registrationTutorialCompleted: completed
        });
        // Update local state
        setRegistrationTutorialCompletedState(completed);
      } catch (error) {
        console.error('Error updating registration tutorial completed status:', error);
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
      setTutorialCompletedState(false);
      sessionStore.clearSession();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    role,
    loading,
    tutorialEnabled,
    tutorialCompleted,
    salesTutorialCompleted,
    checkoutTutorialCompleted,
    registrationTutorialCompleted,
    setTutorialEnabled: updateTutorialEnabled,
    setTutorialCompleted,
    setSalesTutorialCompleted,
    setCheckoutTutorialCompleted,
    setRegistrationTutorialCompleted,
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