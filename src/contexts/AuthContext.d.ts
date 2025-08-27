import React, { ReactNode } from 'react';
import { User } from 'firebase/auth';
interface AuthContextType {
    currentUser: User | null;
    role: 'admin' | 'member' | null;
    loading: boolean;
    signin: (username: string, password: string) => Promise<void>;
    signup: (name: string, username: string, email: string, password: string) => Promise<void>;
    signout: () => Promise<void>;
}
interface AuthProviderProps {
    children: ReactNode;
}
export declare const AuthProvider: React.FC<AuthProviderProps>;
export declare const useAuth: () => AuthContextType;
export {};
