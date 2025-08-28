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
    navigateToNextTutorialStep(location.pathname);
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={salesStep3TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        
        
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
     
    </FlowContainer>
  );
}

export default SalesStep3PageTutorial;