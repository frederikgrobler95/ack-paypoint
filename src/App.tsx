import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from './config/i18n'
import { useAuth } from './contexts/AuthContext'
import { useMyAssignment } from './contexts/MyAssignmentContext'
import { StallType } from './shared/contracts/stall'
import AuthPage from './routes/auth/AuthPage'
import Home from './routes/home/Home'
import RegistrationPage from './routes/home/registration/RegistrationPage'
import SalesPage from './routes/home/sales/SalesPage'
import SalesStep1Page from './routes/home/sales/step1/SalesStep1Page'
import SalesStep2Page from './routes/home/sales/step2/SalesStep2Page'
import SalesStep3Page from './routes/home/sales/step3/SalesStep3Page'
import CheckoutPage from './routes/home/checkout/CheckoutPage'
import CheckoutStep1Page from './routes/home/checkout/step1/CheckoutStep1Page'
import CheckoutStep2Page from './routes/home/checkout/step2/CheckoutStep2Page'
import CheckoutStep3Page from './routes/home/checkout/step3/CheckoutStep3Page'
import AdminPage from './routes/admin/AdminPage'
import RefundsPage from './routes/home/sales/refunds/RefundsPage'
import RefundsStep1Page from './routes/home/sales/refunds/step1/RefundsStep1Page'
import RefundsStep2Page from './routes/home/sales/refunds/step2/RefundsStep2Page'
import RefundsStep3Page from './routes/home/sales/refunds/step3/RefundsStep3Page'
import RefundsStep4Page from './routes/home/sales/refunds/step4/RefundsStep4Page'
import DashboardPage from './routes/admin/dashboard/DashboardPage'
import UsersPage from './routes/admin/users/UsersPage'
import StallsPage from './routes/admin/stalls/StallsPage'
import CustomersPage from './routes/admin/customers/CustomersPage'
import QRCodesPage from './routes/admin/qrcodes/QRCodesPage'
import AddUserPage from './routes/admin/users/adduser/AddUsersPage'
import UserDetailsPage from './routes/admin/users/userdetails/UserDetailsPage'
import AddUsersScreen from './routes/admin/users/adduser/AddUsersPage'
import RoleSelectionPage from './routes/admin/users/updateuserrole/UpdateUserRolePage'
import StallDetailsPage from './routes/admin/stalls/stalldetails/StallDetailsPage'
import OperatorsPage from './routes/admin/stalls/stalldetails/operators/OperatorsPage'
import StallStatsPage from './routes/admin/stalls/stalldetails/StallStatsPage'
import AddStallScreen from './routes/admin/stalls/AddStallScreen'
import CustomerDetailsPage from './routes/admin/customers/customerdetails/CustomerDetailsPage'
import CreateCustomersScreen from './routes/admin/customers/CreateCustomersScreen'
import ReissueQrCodeScreen from './routes/admin/customers/ReissueQrCodeScreen'
import ReissueQrCodePage from './routes/admin/customers/ReissueQrCodePage'
import BatchesPage from './routes/admin/qrcodes/batches/BatchesPage'
import BatchDetailsPage from './routes/admin/qrcodes/batches/batchdetails/BatchDetailsPage'
import CreateBatchPage from './routes/admin/qrcodes/batches/create/CreateBatchPage'
import GenerateScreen from './routes/admin/qrcodes/GenerateScreen'
import RegistrationStep1Page from './routes/home/registration/step1/RegistrationStep1Page'
import RegistrationStep2Page from './routes/home/registration/step2/RegistrationStep2Page'
import RegistrationStep3Page from './routes/home/registration/step3/RegistrationStep3Page'
import SalesPageTutorial from './routes/tutorial/sales/SalesPageTutorial'
import SalesStep1PageTutorial from './routes/tutorial/sales/step1/SalesStep1PageTutorial'
import SalesStep2PageTutorial from './routes/tutorial/sales/step2/SalesStep2PageTutorial'
import SalesStep3PageTutorial from './routes/tutorial/sales/step3/SalesStep3PageTutorial'
import BottomNavigation from './shared/ui/BottomNavigation'
import Header from './shared/ui/Header'
import MockHeader from './shared/ui/MockHeader'
import { PWANotification } from './components'
import GlobalSpinner from './shared/ui/GlobalSpinner'
import ToastContainer from './shared/ui/ToastContainer'
// Registration Tutorial Components
import RegistrationPageTutorial from './routes/tutorial/registration/RegistrationPageTutorial'
import RegistrationStep1PageTutorial from './routes/tutorial/registration/step1/RegistrationStep1PageTutorial'
import RegistrationStep2PageTutorial from './routes/tutorial/registration/step2/RegistrationStep2PageTutorial'
import RegistrationStep3PageTutorial from './routes/tutorial/registration/step3/RegistrationStep3PageTutorial'
// Checkout Tutorial Components
import CheckoutPageTutorial from './routes/tutorial/checkout/CheckoutPageTutorial'
import CheckoutStep1PageTutorial from './routes/tutorial/checkout/step1/CheckoutStep1PageTutorial'
import CheckoutStep2PageTutorial from './routes/tutorial/checkout/step2/CheckoutStep2PageTutorial'
import CheckoutStep3PageTutorial from './routes/tutorial/checkout/step3/CheckoutStep3PageTutorial'
// Tutorial Completion Components
import RegistrationTutorialComplete from './routes/tutorial/registration/RegistrationTutorialComplete'
import SalesTutorialComplete from './routes/tutorial/sales/SalesTutorialComplete'
import CheckoutTutorialComplete from './routes/tutorial/checkout/CheckoutTutorialComplete'
// Refunds Tutorial Components
import RefundsPageTutorial from './routes/tutorial/refunds/RefundsPageTutorial'
import RefundsStep1PageTutorial from './routes/tutorial/refunds/step1/RefundsStep1PageTutorial'
import RefundsStep2PageTutorial from './routes/tutorial/refunds/step2/RefundsStep2PageTutorial'
import RefundsStep3PageTutorial from './routes/tutorial/refunds/step3/RefundsStep3PageTutorial'
import RefundsStep4PageTutorial from './routes/tutorial/refunds/step4/RefundsStep4PageTutorial'
import RefundsTutorialComplete from './routes/tutorial/refunds/RefundsTutorialComplete'

function App(): React.JSX.Element {
  const { t } = useTranslation()
  const { currentUser, loading, tutorialEnabled } = useAuth();
  const { stall, isLoading: assignmentLoading } = useMyAssignment();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to map stall type to tutorial type
  const getRequiredTutorialForStall = (stallType: StallType): 'sales' | 'registration' | 'checkout' => {
    switch (stallType) {
      case 'registration':
        return 'registration';
      case 'checkout':
        return 'checkout';
      case 'commerce':
        return 'sales';
      default:
        return 'sales'; // fallback
    }
  };
// Helper function to check if user should be restricted to tutorial mode
  const shouldRestrictToTutorial = () => {
    return tutorialEnabled && currentUser;
  };

  // Redirect to tutorial if tutorial is enabled and user is not already on a tutorial page
  // Redirect to main app if tutorial is completed</search>

  useEffect(() => {
    // Only run this effect if we have the necessary data
    if (loading || assignmentLoading) return;
    
    // If user is not authenticated, don't do anything
    if (!currentUser) return;
    
    // Check if we're already on a tutorial page
    const isOnTutorialPage = location.pathname.startsWith('/tutorial');
    
    // Check if user should be restricted to tutorial mode
    const restrictToTutorial = shouldRestrictToTutorial();
    
    // If user should be in tutorial mode but is not on a tutorial page, redirect to appropriate tutorial
    if (restrictToTutorial && !isOnTutorialPage) {
      // If user has a stall assignment, redirect to the appropriate tutorial for their stall
      if (stall?.type) {
        const requiredTutorial = getRequiredTutorialForStall(stall.type);
        // Only navigate if we're not already going to the correct tutorial
        if (location.pathname !== `/tutorial/${requiredTutorial}`) {
          navigate(`/tutorial/${requiredTutorial}`);
        }
      } else {
        // Fallback: If no stall assignment, redirect to sales tutorial
        if (location.pathname !== '/tutorial/sales') {
          navigate('/tutorial/sales');
        }
      }
    }
    // If user is not supposed to be in tutorial mode but is on a tutorial page, redirect to home
    else if (!restrictToTutorial && isOnTutorialPage && location.pathname !== '/') {
      navigate('/');
    }
  }, [tutorialEnabled, currentUser, location.pathname, stall, loading, assignmentLoading]); // Remove navigate from dependencies
  
  console.log('App: rendering with loading state:', loading, 'and currentUser:', currentUser);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className=" bg-gray-50 flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
      </div>
    );
  }

  // Show auth pages if user is not authenticated
  if (!currentUser) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    );
  }

  // Show main app if user is authenticated
  return (
    <>
      <GlobalSpinner />
      <ToastContainer />
      {location.pathname.startsWith('/tutorial') ? <MockHeader autoOpenDropdown={location.pathname === '/tutorial/refunds'} /> : <Header />}
      <PWANotification />

      <h1>{t('hello_world')}</h1>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
      <button onClick={() => i18n.changeLanguage('fr')}>French</button>
      <button onClick={() => i18n.changeLanguage('af')}>Afrikaans</button>
      
      <div className={`pt-16 ${location.pathname.startsWith('/tutorial') ? 'pb-4' : 'pb-16'}`}> {/* Adjust padding based on tutorial mode */}
        <Routes>
          {/* Tutorial Routes - Always accessible */}
          <Route path="/tutorial/sales" element={<SalesPageTutorial />} />
          <Route path="/tutorial/sales/step1" element={<SalesStep1PageTutorial />} />
          <Route path="/tutorial/sales/step2" element={<SalesStep2PageTutorial />} />
          <Route path="/tutorial/sales/step3" element={<SalesStep3PageTutorial />} />
          <Route path="/tutorial/checkout" element={<CheckoutPageTutorial />} />
          <Route path="/tutorial/checkout/step1" element={<CheckoutStep1PageTutorial />} />
          <Route path="/tutorial/checkout/step2" element={<CheckoutStep2PageTutorial />} />
          <Route path="/tutorial/checkout/step3" element={<CheckoutStep3PageTutorial />} />
          <Route path="/tutorial/registration" element={<RegistrationPageTutorial />} />
          <Route path="/tutorial/registration/step1" element={<RegistrationStep1PageTutorial />} />
          <Route path="/tutorial/registration/step2" element={<RegistrationStep2PageTutorial />} />
          <Route path="/tutorial/registration/step3" element={<RegistrationStep3PageTutorial />} />
          <Route path="/tutorial/registration/complete" element={<RegistrationTutorialComplete />} />
          <Route path="/tutorial/sales/complete" element={<SalesTutorialComplete />} />
          <Route path="/tutorial/checkout/complete" element={<CheckoutTutorialComplete />} />
          <Route path="/tutorial/refunds" element={<RefundsPageTutorial />} />
          <Route path="/tutorial/refunds/step1" element={<RefundsStep1PageTutorial />} />
          <Route path="/tutorial/refunds/step2" element={<RefundsStep2PageTutorial />} />
          <Route path="/tutorial/refunds/step3" element={<RefundsStep3PageTutorial />} />
          <Route path="/tutorial/refunds/step4" element={<RefundsStep4PageTutorial />} />
          <Route path="/tutorial/refunds/complete" element={<RefundsTutorialComplete />} />
          
          {/* Main App Routes - Only accessible when not in tutorial mode */}
          {!shouldRestrictToTutorial() && (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/registration" element={<RegistrationPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/sales/salesstep1" element={<SalesStep1Page />} />
              <Route path="/sales/salesstep2" element={<SalesStep2Page />} />
              <Route path="/sales/salesstep3" element={<SalesStep3Page />} />
              <Route path="/sales/refunds" element={<RefundsPage />} />
              <Route path="/sales/refunds/refundsstep1" element={<RefundsStep1Page />} />
              <Route path="/sales/refunds/refundsstep2" element={<RefundsStep2Page />} />
              <Route path="/sales/refunds/refundsstep3" element={<RefundsStep3Page />} />
              <Route path="/sales/refunds/refundsstep4" element={<RefundsStep4Page />} />
              <Route path="/registration/step1" element={<RegistrationStep1Page />} />
              <Route path="/registration/step2" element={<RegistrationStep2Page />} />
              <Route path="/registration/step3" element={<RegistrationStep3Page />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/checkout/step1" element={<CheckoutStep1Page />} />
              <Route path="/checkout/step2" element={<CheckoutStep2Page />} />
              <Route path="/checkout/step3" element={<CheckoutStep3Page />} />
              <Route path="/admin" element={<AdminPage />}>
                <Route index element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/add" element={<AddUsersScreen />} />
                <Route path="users/role/:id" element={<RoleSelectionPage />} />
                <Route path="users/addUser" element={<AddUserPage />} />
                <Route path="users/userdetails/:id" element={<UserDetailsPage />} />
                <Route path="stalls" element={<StallsPage />} />
                <Route path="stalls/add" element={<AddStallScreen />} />
                <Route path="stalls/stalldetails/:id" element={<StallDetailsPage />} />
                <Route path="stalls/stalldetails/:id/operators" element={<OperatorsPage />} />
                <Route path="stalls/stalldetails/:id/stats" element={<StallStatsPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/create" element={<CreateCustomersScreen />} />
                <Route path="customers/customerdetails/:id" element={<CustomerDetailsPage />} />
                <Route path="customers/reissue-qr-screen/:id" element={<ReissueQrCodeScreen />} />
                <Route path="customers/reissue-qr/:id" element={<ReissueQrCodePage />} />
                <Route path="qrcodes" element={<QRCodesPage />} />
                <Route path="qrcodes/generate" element={<GenerateScreen />} />
                <Route path="qrcodes/batches" element={<BatchesPage />} />
                <Route path="qrcodes/batches/batchdetails/:id" element={<BatchDetailsPage />} />
                <Route path="qrcodes/batches/create" element={<CreateBatchPage />} />
              </Route>
            </>
          )}
        </Routes>
      </div>
      {/* Hide bottom navigation during tutorial mode */}
      {!location.pathname.startsWith('/tutorial') && <BottomNavigation />}
    </>
  )
}

export default App