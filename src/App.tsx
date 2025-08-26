import { Routes, Route, Link } from 'react-router-dom'
import React from 'react'
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
import './App.css'

function App(): React.JSX.Element {
  return (
    <>
      <nav>
              <Link to="/">Home</Link> |
              <Link to="/about"> About</Link> |
              <Link to="/registration"> Registration</Link> |
              <Link to="/sales"> Sales</Link> |
              <Link to="/checkout"> Checkout</Link> |
              <Link to="/admin"> Admin</Link>
            </nav>
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
    </>
  )
}

export default App
