import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithUsernameAndPassword, signUpWithEmailAndPassword, signOut } from '../services/auth';
import { User } from 'firebase/auth';
import { useSessionStore } from '../shared/stores/sessionStore';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  role: 'admin' | 'member' | null;
  loading: boolean;
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
            setRole(userRole);
            sessionStore.setRole(userRole);
            sessionStore.setDisplayName(userData.name || user.displayName);
          } else {
            setRole('member');
            sessionStore.setRole('member');
            sessionStore.setDisplayName(user.displayName);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole('member');
          sessionStore.setRole('member');
          sessionStore.setDisplayName(user.displayName);
        }
      } else {
        setRole(null);
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

  const signout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      setRole(null);
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