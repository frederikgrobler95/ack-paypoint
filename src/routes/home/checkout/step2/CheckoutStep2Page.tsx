import React from 'react'

function CheckoutStep2Page(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 2</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h2>
        <p className="text-gray-600">Select or enter payment details for this transaction.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Credit Card</p>
            <p className="text-sm text-gray-500">Pay with credit or debit card</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Select
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Cash</p>
            <p className="text-sm text-gray-500">Pay with cash tender</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Select
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Customer Account</p>
            <p className="text-sm text-gray-500">Charge to customer's account</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Select
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutStep2Page