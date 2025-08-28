import React from 'react'
import { useTranslation } from 'react-i18next'
import { useMyAssignment } from '../../contexts/MyAssignmentContext'
import RegistrationPage from './registration/RegistrationPage'
import SalesPage from './sales/SalesPage'
import CheckoutPage from './checkout/CheckoutPage'
import Header from '../../shared/ui/Header'

function Home(): React.JSX.Element {
  const { t } = useTranslation()
  const { stall, isLoading, error } = useMyAssignment()

  // Show loading state
  if (isLoading) {
    return (
      <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">{t('loadingYourAssignment')}</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error')}</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-gray-500">{t('contactSupport')}</p>
        </div>
      </div>
    )
  }

  // Show message if user has no assignment
  if (!stall) {
    return (
      <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('noAssignment')}</h1>
          <p className="text-gray-700 mb-4">{t('notAssignedToStall')}</p>
          <p className="text-gray-500">{t('contactAdminToGetAssigned')}</p>
        </div>
      </div>
    )
  }

  // Show the appropriate page based on stall type
  switch (stall.type) {
    case 'registration':
      return (
        <>
          <Header title={t('registrationHeader', { stallName: stall.name })} showNavigation={false} />
          <RegistrationPage />
        </>
      );
    case 'commerce':
      return (
        <>
          <Header title={stall.name} showNavigation={false} />
          <SalesPage />
        </>
      );
    case 'checkout':
      return (
        <>
          <Header title={t('checkoutHeader', { stallName: stall.name })} showNavigation={false} />
          <CheckoutPage />
        </>
      );
    default:
      return (
        <>
          <Header />
          <div className=" bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('unknownAssignment')}</h1>
              <p className="text-gray-700 mb-4">{t('stallAssignmentNotRecognized')}</p>
              <p className="text-gray-500">{t('stallType', { stallType: stall.type })}</p>
              <p className="text-gray-500">{t('contactSupport')}</p>
            </div>
          </div>
        </>
      )
  }
}

export default Home