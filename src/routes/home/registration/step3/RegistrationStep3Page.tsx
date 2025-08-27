import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCreateCustomerMutation } from '../../../../mutations/useCreateCustomerMutation'
import { useWorkStore } from '../../../../shared/stores/workStore'

function RegistrationStep3Page(): React.JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const name = searchParams.get('name') || ''
  const phone = searchParams.get('phone') || ''
  const qrCodeId = searchParams.get('code') || ''
  const currentStallId = useWorkStore((state) => state.currentStallId)
  
  const { mutate: createCustomer, isPending, isError, error } = useCreateCustomerMutation()
  
  const handleConfirmRegistration = () => {
    // Generate a unique idempotency key using qrCodeId and timestamp
    const idempotencyKey = `${qrCodeId}_${Date.now()}`;
    
    createCustomer({
      name,
      phoneE164: phone,
      phoneRaw: phone,
      qrCodeId,
      stallId: currentStallId || '',
      idempotencyKey
    }, {
      onSuccess: () => {
        // Navigate back to the home page on successful registration
        navigate('/')
      }
    })
  }

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
            <p className="text-lg font-bold text-gray-900">{name}</p>
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
            <p className="text-lg font-bold text-gray-900">{phone}</p>
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
      
      {/* Loading indicator */}
      {isPending && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          Registering customer...
        </div>
      )}
      
      {/* Error message */}
      {isError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          Error registering customer: {error?.message || 'Unknown error'}
        </div>
      )}
      
      <div className="fixed bottom-20 right-6">
        <button
          onClick={handleConfirmRegistration}
          disabled={isPending}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="text-xl">Confirm Registration</span>
        </button>
      </div>
    </div>
  )
}

export default RegistrationStep3Page