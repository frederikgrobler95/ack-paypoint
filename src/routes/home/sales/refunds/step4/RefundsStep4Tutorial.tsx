import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '@/shared/ui';
import { TutorialTour } from '@/components/tutorial';
import { useTutorialStore } from '@/shared/stores/tutorialStore';
import withTutorial from '@/hocs/withTutorial';

// Define the steps for the checkout tutorial
const checkoutTutorialSteps = [
  {
    target: '.receipt-display',
    content: 'This section shows the refund receipt with all the details.',
    disableBeacon: true,
  },
  {
    target: '.print-button',
    content: 'Click this button to print the refund receipt.',
  },
  {
    target: '.new-refund-button',
    content: 'Click this button to start a new refund transaction.',
  },
];

function RefundsStep4Tutorial() {
  const navigate = useNavigate();
  const { mockData, onCompleteTutorial, markTutorialAsCompleted, setCheckoutTutorialCompleted } = useTutorialStore();

  const handleCompleteTutorial = () => {
    onCompleteTutorial();
    setCheckoutTutorialCompleted(true);
    markTutorialAsCompleted();
    // Navigate back to the main tutorial page
    navigate('/tutorial/checkout');
  };

  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutTutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout Tutorial - Step 4</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to view the refund receipt and complete the process.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock Refund Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Customer:</span> {mockData.checkout.customerName}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Transaction ID:</span> TXN-001
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Refund ID:</span> REF-001
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Amount:</span> R {(mockData.checkout.amountCents / 100).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/tutorial/checkout/step3')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          
          <button
            onClick={handleCompleteTutorial}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Complete Tutorial
          </button>
        </div>
      </div>
    </FlowContainer>
  );
}

export default withTutorial(RefundsStep4Tutorial, 'checkout');