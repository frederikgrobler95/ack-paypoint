import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQRCodeCustomer } from '../../../../queries/qrCodes'

function CheckoutStep2Page(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qrCode = searchParams.get('code') || ''
  
  const { data: qrData, isLoading, isError } = useQRCodeCustomer(qrCode)
  
  const handlePaymentMethodSelect = (method: 'card' | 'cash' | 'eft') => {
    navigate(`/home/checkout/step3?code=${encodeURIComponent(qrCode)}&method=${method}`)
  }
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`
  }
  
  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 2</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    )
  }
  
  if (isError || !qrData) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 2</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">Error loading customer details. Please try again.</p>
        </div>
      </div>
    )
  }
  
  const { customer } = qrData
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 2</h1>
      
      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Details</h2>
        <div className="mb-4">
          <p className="text-gray-600">Name</p>
          <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
        </div>
        <div>
          <p className="text-gray-600">Outstanding Amount</p>
          <p className="text-xl font-bold text-red-600">{formatAmount(customer.Account.balanceCents)}</p>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h2>
        <p className="text-gray-600 mb-4">Select a payment method for this transaction.</p>
        
        <div className="space-y-3">
          <button
            onClick={() => handlePaymentMethodSelect('card')}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-4 text-left hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">Card</p>
                <p className="text-sm text-gray-500">Pay with credit or debit card</p>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                Select
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handlePaymentMethodSelect('cash')}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-4 text-left hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">Cash</p>
                <p className="text-sm text-gray-500">Pay with cash tender</p>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                Select
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handlePaymentMethodSelect('eft')}
            className="w-full bg-white border border-gray-300 rounded-lg shadow-sm p-4 text-left hover:bg-gray-50 transition duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">EFT</p>
                <p className="text-sm text-gray-500">Electronic funds transfer</p>
              </div>
              <div className="text-lg font-semibold text-blue-600">
                Select
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutStep2Page