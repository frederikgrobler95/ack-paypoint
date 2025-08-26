import React from 'react'

function CheckoutStep3Page(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 3</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Transaction Summary</h2>
        <p className="text-gray-600">Review and complete the transaction details.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Total Amount</p>
            <p className="text-sm text-gray-500">Including taxes</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            R125.50
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Payment Method</p>
            <p className="text-sm text-gray-500">Credit Card (**** 1234)</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            Confirmed
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Change Due</p>
            <p className="text-sm text-gray-500">If applicable</p>
          </div>
          <div className="text-lg font-semibold text-gray-600">
            R0.00
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-20 right-6">
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <span className="text-xl">Complete Transaction</span>
        </button>
      </div>
    </div>
  )
}

export default CheckoutStep3Page