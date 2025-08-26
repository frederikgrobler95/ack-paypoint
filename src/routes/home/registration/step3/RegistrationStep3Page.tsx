import React from 'react'

function RegistrationStep3Page(): React.JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration - Step 3</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Confirmation</h2>
        <p className="text-gray-600">Review and confirm the customer's registration details.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">John Smith</p>
            <p className="text-sm text-gray-500">Customer Name</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            Verified
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">072 123 4567</p>
            <p className="text-sm text-gray-500">Phone Number</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            Verified
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">Standard Account</p>
            <p className="text-sm text-gray-500">Account Type</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            Confirmed
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-20 right-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
          <span className="text-xl">Complete Registration</span>
        </button>
      </div>
    </div>
  )
}

export default RegistrationStep3Page