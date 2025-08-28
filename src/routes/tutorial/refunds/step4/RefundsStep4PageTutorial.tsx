import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';
import { useToast } from '../../../../contexts/ToastContext';

// Define the steps for the refunds step 4 tutorial
const refundsStep4TutorialSteps = [
  {
    target: '.refund-confirmation',
    content: 'This is the confirm refund screen showing all the details of the refund transaction.',
    disableBeacon: true,
  },
  {
    target: '.confirm-refund-button',
    content: 'Click this button to confirm and process the refund transaction.',
  },
];

function RefundsStep4PageTutorial() {
  const navigate = useNavigate();
  const { mockRefundsData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const { showToast } = useToast();
  
  const handleConfirmRefund = () => {
    // In tutorial mode, just show a success message and navigate to refunds complete page
    showToast('Refund processed successfully', 'success');
    // Navigate to refunds tutorial complete page
    navigate('/tutorial/refunds/complete');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep4TutorialSteps} />
      
      <div className="refund-confirmation p-4">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Customer</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Name</span>
            <span className="font-medium">{mockRefundsData.customerName}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">QR Code</span>
            <span className="font-medium">{mockRefundsData.qrCode?.substring(0, 8) + '...'}</span>
          </div>
        </div>
        
        {/* Original Transaction */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Original Transaction</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Transaction ID</span>
            <span className="font-medium">TUTORIAL...</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">R {formatAmount(mockRefundsData.originalAmountCents)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Operator</span>
            <span className="font-medium">Tutorial Operator</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Refund Amount */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Refund Amount</h2>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-indigo-600">R {formatAmount(mockRefundsData.refundAmountCents)}</p>
          </div>
        </div>
        
        {/* Confirm Button */}
        <div className="mt-auto">
          <button
            onClick={handleConfirmRefund}
            className="confirm-refund-button w-full py-3 px-4 rounded-md text-white font-semibold transition duration-200 bg-indigo-600 hover:bg-indigo-700"
          >
            Complete Tutorial
          </button>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep4PageTutorial;