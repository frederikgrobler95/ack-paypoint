import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';

// Define the steps for the checkout step 2 tutorial
const checkoutStep2TutorialSteps = [
  {
    target: '.customer-details-section',
    content: 'This section shows the customer details for the checkout.',
    disableBeacon: true,
  },
  {
    target: '.payment-method-section',
    content: 'Select a payment method for this transaction.',
  },
  {
    target: '.tutorial-navigation',
    content: 'Use these buttons to navigate between tutorial steps or exit the tutorial.',
  },
];

function CheckoutStep2PageTutorial() {
  const navigate = useNavigate();
  const { mockCheckoutData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'cash' | 'eft' | null>(null);
  const [error, setError] = useState('');
  
  const handlePaymentMethodSelect = (method: 'card' | 'cash' | 'eft') => {
    setSelectedMethod(method);
    setError('');
  };
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    
    setError('');
    
    // Navigate to next step
    navigateToNextTutorialStep('/tutorial/checkout/step2');
  };
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutStep2TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout Tutorial - Step 2: Payment Method</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to select a payment method for the checkout.
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
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Customer Details</h2>
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
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Payment Method</h2>
          <p className="text-gray-600 mb-4">Select a payment method for this transaction.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handlePaymentMethodSelect('card')}
              className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition duration-200 ${
                selectedMethod === 'card' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">Card</p>
                  <p className="text-sm text-gray-500">Pay with credit or debit card</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedMethod === 'card' ? 'Selected' : 'Select'}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('cash')}
              className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition duration-200 ${
                selectedMethod === 'cash' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">Cash</p>
                  <p className="text-sm text-gray-500">Pay with cash tender</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedMethod === 'cash' ? 'Selected' : 'Select'}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('eft')}
              className={`w-full bg-white border rounded-lg shadow-sm p-4 text-left transition duration-200 ${
                selectedMethod === 'eft' 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">EFT</p>
                  <p className="text-sm text-gray-500">Electronic funds transfer</p>
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedMethod === 'eft' ? 'Selected' : 'Select'}
                </div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <button
          onClick={handleNext}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
        >
          Next
        </button>
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
              onClick={() => navigate('/tutorial/checkout/step1')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            
            <button
              onClick={() => navigateToNextTutorialStep('/tutorial/checkout/step2')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default CheckoutStep2PageTutorial;