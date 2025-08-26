import React, { createContext, useContext } from 'react'
import { auth, firestore, functions } from './index'
import { User } from 'firebase/auth'

interface FirebaseContextType {
  auth: typeof auth
  firestore: typeof firestore
  functions: typeof functions
  currentUser: User | null
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined)

interface FirebaseProviderProps {
  children: React.ReactNode
  currentUser: User | null
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ 
  children, 
  currentUser 
}) => {
  return (
    <FirebaseContext.Provider value={{ 
      auth, 
      firestore, 
      functions, 
      currentUser 
    }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider')
  }
  return context
}