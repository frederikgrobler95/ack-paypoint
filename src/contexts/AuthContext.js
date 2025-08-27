"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = void 0;
const react_1 = __importStar(require("react"));
const auth_1 = require("../services/auth");
const sessionStore_1 = require("../shared/stores/sessionStore");
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../firebase");
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = (0, react_1.useState)(null);
    const [role, setRole] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const sessionStore = (0, sessionStore_1.useSessionStore)();
    (0, react_1.useEffect)(() => {
        console.log('AuthContext: useEffect triggered');
        const unsubscribe = (0, auth_1.onAuthStateChanged)(async (user) => {
            console.log('AuthContext: onAuthStateChanged callback triggered', user);
            setCurrentUser(user);
            sessionStore.setUser(user);
            if (user) {
                // Fetch user role from Firestore
                try {
                    const firestore = (0, firestore_1.getFirestore)(firebase_1.app);
                    const userDoc = await (0, firestore_1.getDoc)((0, firestore_1.doc)(firestore, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const userRole = userData.role || 'member';
                        setRole(userRole);
                        sessionStore.setRole(userRole);
                        sessionStore.setDisplayName(userData.name || user.displayName);
                    }
                    else {
                        setRole('member');
                        sessionStore.setRole('member');
                        sessionStore.setDisplayName(user.displayName);
                    }
                }
                catch (error) {
                    console.error('Error fetching user role:', error);
                    setRole('member');
                    sessionStore.setRole('member');
                    sessionStore.setDisplayName(user.displayName);
                }
            }
            else {
                setRole(null);
                sessionStore.clearSession();
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []); // Remove sessionStore from dependencies to prevent re-runs
    const signin = async (username, password) => {
        try {
            await (0, auth_1.signInWithUsernameAndPassword)(username, password);
        }
        catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };
    const signup = async (name, username, email, password) => {
        try {
            await (0, auth_1.signUpWithEmailAndPassword)(name, username, email, password);
        }
        catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    };
    const signout = async () => {
        try {
            await (0, auth_1.signOut)();
            setCurrentUser(null);
            setRole(null);
            sessionStore.clearSession();
        }
        catch (error) {
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
    return (react_1.default.createElement(AuthContext.Provider, { value: value }, !loading && children));
};
exports.AuthProvider = AuthProvider;
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
