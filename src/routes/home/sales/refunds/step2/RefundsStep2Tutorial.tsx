import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '@/shared/ui';
import { TutorialTour } from '@/components/tutorial';
import { useTutorialStore } from '@/shared/stores/tutorialStore';
import withTutorial from '@/hocs/withTutorial';

// Define the steps for the checkout tutorial
const checkoutTutorialSteps = [
  {
    target: '.customer-info',
    content: 'This section shows the customer information for the refund.',
    disableBeacon: true,
  },
  {
    target: '.transactions-list',
    content: 'This is the list of transactions for this customer. Select one to refund.',
  },
  {
    target: '.transaction-card',
    content: 'Each transaction card shows details about a previous sale. Click on one to proceed with the refund.',
  },
];

function RefundsStep2Tutorial() {
  const navigate = useNavigate();
  const { mockData, onCompleteTutorial, markTutorialAsCompleted } = useTutorialStore();

  const handleCompleteTutorial = () => {
    onCompleteTutorial();
    markTutorialAsCompleted();
    // Navigate to the next step of the tutorial
    navigate('/tutorial/checkout/step3');
  };

  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutTutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout Tutorial - Step 2</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to select a transaction to refund for the customer.
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
              <span className="font-medium">Customer:</span> {mockData.checkout.customerName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">QR Code:</span> {mockData.checkout.qrCode}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/tutorial/checkout/step1')}
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

export default withTutorial(RefundsStep2Tutorial, 'checkout');