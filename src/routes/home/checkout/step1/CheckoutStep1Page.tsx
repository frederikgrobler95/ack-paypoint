import React from 'react'

function CheckoutStep1Page(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 1</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Scan Items</h2>
        <p className="text-gray-600">Scan or enter product codes to add items to the cart.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Product Scanner</p>
            <p className="text-sm text-gray-500">Use camera to scan product barcodes</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Scan
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Manual Entry</p>
            <p className="text-sm text-gray-500">Enter product codes manually</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Enter
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Cart Summary</p>
            <p className="text-sm text-gray-500">3 items - R125.50</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            View
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutStep1Page