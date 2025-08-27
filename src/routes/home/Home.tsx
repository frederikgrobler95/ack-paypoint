import React from 'react'
import { useMyAssignment } from '../../contexts/MyAssignmentContext'
import RegistrationPage from './registration/RegistrationPage'
import SalesPage from './sales/SalesPage'
import CheckoutPage from './checkout/CheckoutPage'
import Header from '../../shared/ui/Header'

function Home(): React.JSX.Element {
  const { stall, isLoading, error } = useMyAssignment()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading your assignment...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-500">Please contact support if this issue persists.</p>
        </div>
      </div>
    )
  }

  // Show message if user has no assignment
  if (!stall) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Assignment</h1>
          <p className="text-gray-700 mb-4">You are not currently assigned to any stall.</p>
          <p className="text-gray-500">Please contact your administrator to get assigned to a stall.</p>
        </div>
      </div>
    )
  }

  // Show the appropriate page based on stall type
  switch (stall.type) {
    case 'registration':
      return (
        <>
          <Header title={`${stall.name} Registration`} showNavigation={false} />
         <div className="pt-4"> {/* Add padding to account for fixed header */}
            <RegistrationPage />
          </div>
        </>
      );
    case 'commerce':
      return (
        <>
          <Header title={`${stall.name} Sales`} showNavigation={false} />
         <div className="pt-4"> {/* Add padding to account for fixed header */}
            <SalesPage />
          </div>
        </>
      );
    case 'checkout':
      return (
        <>
          <Header title={`${stall.name} Checkout`} showNavigation={false} />
         <div className="pt-4"> {/* Add padding to account for fixed header */}
            <CheckoutPage />
          </div>
        </>
      );
    default:
      return (
        <>
          <Header />
         <div className="pt-4"> {/* Add padding to account for fixed header */}
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Unknown Assignment</h1>
                <p className="text-gray-700 mb-4">Your stall assignment type is not recognized.</p>
                <p className="text-gray-500">Stall type: {stall.type}</p>
                <p className="text-gray-500">Please contact support.</p>
              </div>
            </div>
          </div>
        </>
      )
  }
}

export default Home