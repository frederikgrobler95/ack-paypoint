import React from 'react'

function RegistrationStep2Page(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration - Step 2</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Details</h2>
        <p className="text-gray-600">Set up the customer's account information and preferences.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Account Type</p>
            <p className="text-sm text-gray-500">Select the appropriate account category</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Select
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Payment Method</p>
            <p className="text-sm text-gray-500">Preferred payment option</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Configure
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Notifications</p>
            <p className="text-sm text-gray-500">Communication preferences</p>
          </div>
          <div className="text-lg font-semibold text-blue-600">
            Set
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationStep2Page