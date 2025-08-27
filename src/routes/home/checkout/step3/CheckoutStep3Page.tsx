import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQRCodeCustomer } from '../../../../queries/qrCodes';
import { useCreatePaymentMutation } from '@/mutations/useCreatePaymentMutation';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentMethod } from '@/shared/contracts/payment';
import { useMyAssignment } from '@/contexts/MyAssignmentContext';

function CheckoutStep3Page(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { qrCode, idempotencyKey, method: paymentMethod } = location.state || {};
  
  const { data: qrData, isLoading: isQrLoading, isError: isQrError } = useQRCodeCustomer(qrCode);
  const { currentUser } = useAuth();
  const { assignment, stall } = useMyAssignment();
  const { mutate: checkoutCustomer, isPending: isCheckoutLoading, isError: isCheckoutError, error: checkoutError } = useCreatePaymentMutation();
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };
  
  // Get payment method display name
  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'card': return 'Card';
      case 'cash': return 'Cash';
      case 'eft': return 'EFT';
      default: return 'Unknown';
    }
  };
  
  // Handle confirm checkout
  const handleConfirmCheckout = () => {
    if (!qrData || !currentUser) return;
    
    checkoutCustomer({
      method: paymentMethod,
      amountCents: qrData.customer.Account.balanceCents,
      operatorId: currentUser.uid,
      customerId: qrData.customer.id,
      idempotencyKey,
      operatorName: currentUser.displayName || currentUser.email || 'Unknown Operator',
      customerName: qrData.customer.name,
      stallId: assignment?.stallId || ''
    }, {
      onSuccess: () => {
        navigate('/');
      },
      onError: (error: any) => {
        console.error('Error processing checkout:', error);
      }
    });
  };
  
  // Loading state for QR code
  if (isQrLoading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 3</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Loading customer details...</p>
        </div>
      </div>
    );
  }
  
  // Error state for QR code
  if (isQrError || !qrData) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 3</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-red-600">Error loading customer details. Please try again.</p>
        </div>
      </div>
    );
  }
  
  const { customer } = qrData;
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout - Step 3</h1>
      
      {/* Customer Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Customer Details</h2>
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
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment Method</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">{getPaymentMethodName(paymentMethod)}</p>
            <p className="text-sm text-gray-500">Selected payment method</p>
          </div>
          <div className="text-lg font-semibold text-green-600">
            Confirmed
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {isCheckoutError && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {checkoutError?.message || 'Error processing checkout. Please try again.'}
        </div>
      )}
      
      {/* Confirm Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleConfirmCheckout}
          disabled={isCheckoutLoading}
          className={`w-full py-4 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            isCheckoutLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white font-bold'
          }`}
        >
          {isCheckoutLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="text-xl">Confirm Checkout</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default CheckoutStep3Page;