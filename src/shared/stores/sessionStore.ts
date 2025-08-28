import { create } from 'zustand';
import type { User } from 'firebase/auth';

// Define the session store state type
interface SessionState {
  user: User | null;
  role: 'admin' | 'member' | null;
  displayName: string | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'admin' | 'member' | null) => void;
  setDisplayName: (displayName: string | null) => void;
  clearSession: () => void;
}

// Create the session store
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  role: null,
  displayName: null,
  setUser: (user) => {
    console.log('Session Store - setUser:', user);
    set({ user });
  },
  setRole: (role) => {
    console.log('Session Store - setRole:', role);
    set({ role });
  },
  setDisplayName: (displayName) => {
    console.log('Session Store - setDisplayName:', displayName);
    set({ displayName });
  },
  clearSession: () => {
    console.log('Session Store - clearSession');
    set({ user: null, role: null, displayName: null });
  },
}));