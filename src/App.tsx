import { Routes, Route, useLocation } from 'react-router-dom'
import React from 'react'
import { useAuth } from './contexts/AuthContext'
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
import BottomNavigation from './shared/ui/BottomNavigation'
import Header from './shared/ui/Header'
import { PWANotification } from './components'
import GlobalSpinner from './shared/ui/GlobalSpinner'
import ToastContainer from './shared/ui/ToastContainer'

function App(): React.JSX.Element {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  console.log('App: rendering with loading state:', loading, 'and currentUser:', currentUser);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
      <Header />
      <PWANotification />
      
      <div className="pb-16 pt-4"> {/* Add padding to prevent content from being hidden behind bottom nav and fixed header */}
        <Routes>
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
        
        </Routes>
      </div>
      <BottomNavigation />
    </>
  )
}

export default App