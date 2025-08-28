import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';

// Define the steps for the checkout step 3 tutorial
const checkoutStep3TutorialSteps = [
  {
    target: '.customer-details-section',
    content: 'This section shows the customer details for the checkout.',
    disableBeacon: true,
  },
  {
    target: '.payment-method-section',
    content: 'This shows the selected payment method for the transaction.',
  },
  {
    target: '.confirm-button',
    content: 'Click this button to confirm and complete the checkout tutorial.',
  },
  
];

function CheckoutStep3PageTutorial() {
  const navigate = useNavigate();
  const { mockCheckoutData, markTutorialAsCompleted } = useTutorialStore();
  const { setCheckoutStepComplete } = useTutorialStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get payment method display name
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'card': return 'Card';
      case 'cash': return 'Cash';
      case 'eft': return 'EFT';
      default: return 'Unknown';
    }
  };
  
  // Handle confirm checkout
  const handleConfirmCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark entire tutorial system as completed
    setCheckoutStepComplete(3);
    markTutorialAsCompleted('checkout');
    
    // Navigate to home or next tutorial
    setIsProcessing(false);
    
    // In a real implementation, we would use the completeTutorialFlow function
    // For now, we'll just navigate to home
    navigate('/');
  };
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutStep3TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
       
        
        {/* Customer Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 customer-details-section">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Customer Details</h2>
          <div className="mb-4">
            <p className="text-gray-600">Name</p>
            <p className="text-lg font-semibold text-gray-900">{mockCheckoutData.customerName}</p>
          </div>
          <div>
            <p className="text-gray-600">Outstanding Amount</p>
            <p className="text-xl font-bold text-red-600">{formatAmount(mockCheckoutData.amountCents)}</p>
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 payment-method-section">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment Method</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{getPaymentMethodName('card')}</p>
              <p className="text-sm text-gray-500">Selected payment method</p>
            </div>
            <div className="text-lg font-semibold text-green-600">
              Confirmed
            </div>
          </div>
        </div>
        
        {/* Confirm Button */}
        <div className="mt-6">
          <button
            onClick={handleConfirmCheckout}
            disabled={isProcessing}
            className={`w-full py-4 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 confirm-button ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white font-bold'
            }`}
          >
            {isProcessing ? (
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
      
      {/* Tutorial Navigation */}
      
    </FlowContainer>
  );
}

export default CheckoutStep3PageTutorial;