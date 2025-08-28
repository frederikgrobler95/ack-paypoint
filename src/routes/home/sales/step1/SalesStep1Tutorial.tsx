import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import withTutorial from '../../../../hocs/withTutorial';

// Define the steps for the sales tutorial
const salesTutorialSteps = [
  {
    target: '.scan-button',
    content: 'This is the scan button. Click it to simulate scanning a QR code in tutorial mode.',
    disableBeacon: true,
  },
  {
    target: '.manual-entry-button',
    content: 'You can also enter QR codes manually. Click here to switch to manual entry.',
  },
  {
    target: '.qr-display',
    content: 'In tutorial mode, the mock QR scanner shows the QR code that will be used.',
  },
];

function SalesStep1Tutorial() {
  const navigate = useNavigate();
  const { mockData, onCompleteTutorial, markTutorialAsCompleted } = useTutorialStore();

  const handleCompleteTutorial = () => {
    onCompleteTutorial();
    markTutorialAsCompleted();
    // Navigate to the next step of the tutorial
    navigate('/tutorial/sales/step2');
  };

  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={salesTutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales Tutorial - Step 1</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            Welcome to the Sales tutorial! In this step, you'll learn how to scan a customer's QR code.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock QR Code Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Customer:</span> {mockData.sales.customerName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">QR Code:</span> {mockData.sales.qrCode}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/tutorial/sales')}
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

export default withTutorial(SalesStep1Tutorial, 'sales');