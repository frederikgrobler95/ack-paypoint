import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    navigateToNextTutorialStep(location.pathname);
  };
  
  // Format amount in Rands
  const formatAmount = (cents: number) => {
    return `R ${(cents / 100).toFixed(2)}`;
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutStep2TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        
        
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
     
    </FlowContainer>
  );
}

export default CheckoutStep2PageTutorial;