import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';
import { useToast } from '../../../../contexts/ToastContext';

// Define the steps for the sales step 3 tutorial
const salesStep3TutorialSteps = [
  {
    target: '.transaction-details',
    content: 'This section shows the details of the transaction you are processing.',
    disableBeacon: true,
  },
  {
    target: '.confirm-button',
    content: 'Click this button to confirm and complete the sale transaction.',
  },
  {
    target: '.tutorial-navigation',
    content: 'Use these buttons to navigate between tutorial steps or exit the tutorial.',
  },
];

function SalesStep3PageTutorial() {
  const navigate = useNavigate();
  const { mockSalesData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const { showToast } = useToast();
  
  const handleConfirmTransaction = () => {
    // In tutorial mode, just show a success message and navigate to home
    showToast('Transaction completed successfully', 'success');
    
    // Navigate to next step (which will complete the tutorial)
    navigateToNextTutorialStep('/tutorial/sales/step3');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={salesStep3TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sales Tutorial - Step 3: Confirm Transaction</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to confirm a sale and view the receipt.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div>
        
        <div className="mb-6 transaction-details">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock Transaction Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Customer:</span> {mockSalesData.customerName}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">QR Code:</span> {mockSalesData.qrCode}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Amount:</span> R {formatAmount(mockSalesData.amountCents)}
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Confirm Transaction</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{mockSalesData.customerName}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transaction Amount:</span>
              <span className="font-medium text-lg">R {formatAmount(mockSalesData.amountCents)}</span>
            </div>
          </div>
          
          <button
            onClick={handleConfirmTransaction}
            className="confirm-button w-full py-3 px-4 rounded-md font-semibold text-white transition duration-200 bg-green-600 hover:bg-green-700"
          >
            Confirm Transaction
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
              onClick={() => navigate('/tutorial/sales/step2')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            
            <button
              onClick={() => navigateToNextTutorialStep('/tutorial/sales/step3')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Complete Tutorial
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default SalesStep3PageTutorial;