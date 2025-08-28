import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useToast } from '../../../../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

function SalesStep3PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the sales step 3 tutorial
  const salesStep3TutorialSteps = [
    {
      target: '.transaction-details',
      content: t('tutorial.sales.step3.transactionDetailsContent'),
      disableBeacon: true,
    },
    {
      target: '.confirm-button',
      content: t('tutorial.sales.step3.confirmButtonContent'),
    },
    
  ];
  const { mockSalesData, setSalesStepComplete, markTutorialAsCompleted } = useTutorialStore();
  const { showToast } = useToast();
  
  const handleConfirmTransaction = () => {
    // In tutorial mode, just show a success message and navigate to home
    showToast(t('tutorial.sales.step3.successMessage'), 'success');
    
    // Navigate to next step (which will complete the tutorial)
    setSalesStepComplete(3);
    markTutorialAsCompleted('sales');
    navigate('/tutorial/sales/complete');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={salesStep3TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('tutorial.sales.step3.confirmTransactionTitle')}</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t('tutorial.sales.step3.customerLabel')}:</span>
              <span className="font-medium">{mockSalesData.customerName}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{t('tutorial.sales.step3.transactionAmountLabel')}:</span>
              <span className="font-medium text-lg">R {formatAmount(mockSalesData.amountCents)}</span>
            </div>
          </div>
          
          <button
            onClick={handleConfirmTransaction}
            className="confirm-button w-full py-3 px-4 rounded-md font-semibold text-white transition duration-200 bg-green-600 hover:bg-green-700"
          >
            {t('tutorial.sales.step3.confirmTransactionButton')}
          </button>
        </div>
      </div>
      
      {/* Tutorial Navigation */}
     
    </FlowContainer>
  );
}

export default SalesStep3PageTutorial;