import React, { Suspense } from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/queries/queryClient'
import { FirebaseProvider } from './firebase/FirebaseContext'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { MyAssignmentProvider } from './contexts/MyAssignmentContext'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import App from './App'
import ToastContainer from './shared/ui/ToastContainer'
import i18n from './config/i18n'
import './index.css'

// State for tracking auth initialization
let initialUser: any = null
let authInitializationError: Error | null = null

// Create a promise that resolves when auth state is determined
const authInitializedPromise = new Promise<void>((resolve) => {
  // Set a timeout for auth initialization to prevent indefinite waiting on mobile networks
  const timeoutId = setTimeout(() => {
    console.warn('Auth initialization timed out, proceeding with app initialization')
    resolve()
  }, 5000) // 5 second timeout for mobile networks

  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      clearTimeout(timeoutId)
      initialUser = user
      unsubscribe()
      resolve()
    },
    (error) => {
      clearTimeout(timeoutId)
      console.error('Auth state change error:', error)
      authInitializationError = error
      unsubscribe()
      resolve()
    }
  )
})

const container = document.getElementById('root')
if (!container) {
  throw new Error('Failed to find the root element')
}

// Mobile-optimized loading component
const MobileOptimizedLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
    <p className="text-gray-600 text-center">Loading application...</p>
  </div>
)

// Mobile-optimized error component
const MobileOptimizedError = ({ error }: { error: Error }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
    <div className="text-red-500 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Initialization Error</h2>
    <p className="text-gray-600 text-center mb-4">
      {error.message || 'An error occurred while initializing the application. Please check your connection and try again.'}
    </p>
    <button
      onClick={() => window.location.reload()}
      className="bg-indigo-600 text-neutral-50 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Retry
    </button>
  </div>
)

// Render the app after auth is initialized
authInitializedPromise.then(() => {
  const root = createRoot(container)
  
  // Handle auth initialization errors
  if (authInitializationError) {
    root.render(
      <StrictMode>
        <MobileOptimizedError error={authInitializationError} />
      </StrictMode>
    )
    return
  }
  
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <FirebaseProvider currentUser={initialUser}>
          <AuthProvider>
            <MyAssignmentProvider>
              <ToastProvider>
                <LoadingProvider>
                  <BrowserRouter>
                    <Suspense fallback={<MobileOptimizedLoading />}>
                      <I18nextProvider i18n={i18n}>
                        <App />
                        <ToastContainer />
                      </I18nextProvider>
                    </Suspense>
                  </BrowserRouter>
                </LoadingProvider>
              </ToastProvider>
            </MyAssignmentProvider>
          </AuthProvider>
        </FirebaseProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}).catch((error) => {
  // Handle promise rejection
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <MobileOptimizedError error={error} />
    </StrictMode>
  )
})