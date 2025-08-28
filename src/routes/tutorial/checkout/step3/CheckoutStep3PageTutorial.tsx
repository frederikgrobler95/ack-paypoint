import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';

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
  {
    target: '.tutorial-navigation',
    content: 'Use these buttons to navigate between tutorial steps or exit the tutorial.',
  },
];

function CheckoutStep3PageTutorial() {
  const navigate = useNavigate();
  const { mockCheckoutData, setCheckoutTutorialCompleted, markTutorialAsCompleted } = useTutorialStore();
  const { exitTutorial } = useTutorialNavigation();
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
    
    // Mark checkout tutorial as completed
    setCheckoutTutorialCompleted(true);
    
    // Check if all tutorials are completed
    const state = useTutorialStore.getState();
    if (state.salesTutorialCompleted && state.registrationTutorialCompleted && state.checkoutTutorialCompleted) {
      // Mark entire tutorial system as completed
      markTutorialAsCompleted();
    }
    
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
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutStep3TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout Tutorial - Step 3: Confirm Checkout</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to confirm and complete a checkout transaction.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Customer:</span> {mockCheckoutData.customerName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Outstanding Amount:</span> {formatAmount(mockCheckoutData.amountCents)}
            </p>
          </div>
        </div>
        
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
      <div className="fixed bottom-4 left-0 right-0 bg-white p-4 border-t border-gray-200 tutorial-navigation">
        <div className="flex justify-between">
          <button
            onClick={exitTutorial}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Exit Tutorial
          </button>
          
          <div className="space-x-2">
            <button
              onClick={() => navigate('/tutorial/checkout/step2')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default CheckoutStep3PageTutorial;