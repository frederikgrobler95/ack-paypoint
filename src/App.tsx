import { Routes, Route, Link } from 'react-router-dom'
import React from 'react'
import { useAuth } from './contexts/AuthContext'
import AuthPage from './routes/auth/AuthPage'
import Home from './routes/home/Home'
import RegistrationPage from './routes/home/registration/RegistrationPage'
import SalesPage from './routes/home/sales/SalesPage'
import CheckoutPage from './routes/home/checkout/CheckoutPage'
import AdminPage from './routes/admin/AdminPage'
import RefundsPage from './routes/home/sales/refunds/RefundsPage'
import DashboardPage from './routes/admin/dashboard/DashboardPage'
import UsersPage from './routes/admin/users/UsersPage'
import StallsPage from './routes/admin/stalls/StallsPage'
import CustomersPage from './routes/admin/customers/CustomersPage'
import QRCodesPage from './routes/admin/qrcodes/QRCodesPage'
import AddUserPage from './routes/admin/users/addUser/AddUserPage'
import UserDetailsPage from './routes/admin/users/userdetails/UserDetailsPage'
import StallDetailsPage from './routes/admin/stalls/stalldetails/StallDetailsPage'
import OperatorsPage from './routes/admin/stalls/stalldetails/operators/OperatorsPage'
import CustomerDetailsPage from './routes/admin/customers/customerdetails/CustomerDetailsPage'
import BatchesPage from './routes/admin/qrcodes/batches/BatchesPage'
import BatchDetailsPage from './routes/admin/qrcodes/batches/batchdetails/BatchDetailsPage'
import CreateBatchPage from './routes/admin/qrcodes/batches/create/CreateBatchPage'
import BottomNavigation from './shared/ui/BottomNavigation'

function App(): React.JSX.Element {
  const { currentUser, loading } = useAuth();
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
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex space-x-4">
          <Link to="/" className="bg-blue-500 hover:text-gray-300 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-gray-300 transition-colors">About</Link>
          <Link to="/registration" className="hover:text-gray-300 transition-colors">Registration</Link>
          <Link to="/sales" className="hover:text-gray-300 transition-colors">Sales</Link>
          <Link to="/checkout" className="hover:text-gray-300 transition-colors">Checkout</Link>
          <Link to="/admin" className="hover:text-gray-300 transition-colors">Admin</Link>
        </div>
      </nav>
      <div className="pb-16"> {/* Add padding to prevent content from being hidden behind bottom nav */}
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/sales/refunds" element={<RefundsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin" element={<AdminPage />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/addUser" element={<AddUserPage />} />
            <Route path="users/userdetails/:id" element={<UserDetailsPage />} />
            <Route path="stalls" element={<StallsPage />} />
            <Route path="stalls/stalldetails/:id" element={<StallDetailsPage />} />
            <Route path="stalls/stalldetails/:id/operators" element={<OperatorsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/customerdetails/:id" element={<CustomerDetailsPage />} />
            <Route path="qrcodes" element={<QRCodesPage />} />
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