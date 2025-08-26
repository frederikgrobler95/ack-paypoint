import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './queries/queryClient'
import { FirebaseProvider } from './firebase/FirebaseContext'
import { AuthProvider } from './contexts/AuthContext'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import App from './App'
import './index.css'

// State for tracking auth initialization
let initialUser: any = null

// Create a promise that resolves when auth state is determined
const authInitializedPromise = new Promise<void>((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    initialUser = user
    unsubscribe()
    resolve()
  })
})

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

// Render the app after auth is initialized
authInitializedPromise.then(() => {
  const root = createRoot(container)
  
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <FirebaseProvider currentUser={initialUser}>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </FirebaseProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
})