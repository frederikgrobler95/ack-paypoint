import React from 'react'

function RegistrationStep1Page(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration - Step 1</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Information</h2>
        <p className="text-gray-600">Enter the customer's basic information to begin registration.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Name</p>
            <p className="text-sm text-gray-500">Customer's full name</p>
          </div>
          <div className="text-lg font-semibold text-gray-600">
            Required
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Phone Number</p>
            <p className="text-sm text-gray-500">Customer's contact number</p>
          </div>
          <div className="text-lg font-semibold text-gray-600">
            Required
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Email</p>
            <p className="text-sm text-gray-500">Customer's email address</p>
          </div>
          <div className="text-lg font-semibold text-gray-600">
            Optional
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationStep1Page