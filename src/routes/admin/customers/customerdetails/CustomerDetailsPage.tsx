import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCustomer } from '@/queries/customers'


function CustomerDetailsPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id || '');

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-800">Error loading customer: {(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Customer Details</h1>
          </div>
          {customer && (
            <button
              onClick={() => navigate(`/admin/customers/reissue-qr-screen/${id}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Reissue QR Code
            </button>
          )}
        </div>
        
        {customer ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">Customer Information</h2>
                <p className="text-gray-600"><span className="font-medium">ID:</span> {customer.id}</p>
                <p className="text-gray-600"><span className="font-medium">Name:</span> {customer.name}</p>
                <p className="text-gray-600"><span className="font-medium">Phone:</span> {customer.phoneE164}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-2">Account Information</h2>
                <p className="text-gray-600"><span className="font-medium">QR Code ID:</span> {customer.qrCodeId || 'None'}</p>
                <p className="text-gray-600"><span className="font-medium">Account Status:</span> {customer.Account.status}</p>
                <p className="text-gray-600"><span className="font-medium">Account Balance:</span> R{(customer.Account.balanceCents / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Customer not found.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default CustomerDetailsPage