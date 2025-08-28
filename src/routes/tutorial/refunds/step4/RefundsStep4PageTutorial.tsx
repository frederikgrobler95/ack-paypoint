import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';

function RefundsStep4PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mockRefundsData, setRefundsStepComplete } = useTutorialStore();

  // Define the steps for the refunds step 4 tutorial
  const refundsStep4TutorialSteps = [
    {
      target: '.refund-confirmation',
      content: t('tutorial.refunds.step4.confirmationScreenContent'),
      disableBeacon: true,
    },
    {
      target: '.confirm-refund-button',
      content: t('tutorial.refunds.step4.confirmButtonContent'),
    },
  ];
  
  const handleConfirmRefund = () => {
    // In tutorial mode, just show a success message and navigate to refunds complete page
    // Navigate to refunds tutorial complete page
    setRefundsStepComplete(4);
    navigate('/tutorial/refunds/complete');
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep4TutorialSteps} />
      
      <div className="refund-confirmation p-4">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('tutorial.refunds.step4.customerTitle')}</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('tutorial.refunds.step4.nameLabel')}</span>
            <span className="font-medium">{mockRefundsData.customerName}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">{t('tutorial.refunds.step4.qrCodeLabel')}</span>
            <span className="font-medium">{mockRefundsData.qrCode?.substring(0, 8)}</span>
          </div>
        </div>
        
        {/* Original Transaction */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('tutorial.refunds.step4.originalTransactionTitle')}</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('tutorial.refunds.step4.transactionIdLabel')}</span>
            <span className="font-medium">000321</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">{t('tutorial.refunds.step4.amountLabel')}</span>
            <span className="font-medium">R {formatAmount(mockRefundsData.originalAmountCents)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">{t('tutorial.refunds.step4.operatorLabel')}</span>
            <span className="font-medium">John</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600">{t('tutorial.refunds.step4.dateLabel')}</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Refund Amount */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('tutorial.refunds.step4.refundAmountTitle')}</h2>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-indigo-600">R 750.00</p>
          </div>
        </div>
        
        {/* Confirm Button */}
        <div className="mt-auto">
          <button
            onClick={handleConfirmRefund}
            className="confirm-refund-button w-full py-3 px-4 rounded-md text-white font-semibold transition duration-200 bg-indigo-600 hover:bg-indigo-700"
          >
            {t('tutorial.refunds.step4.completeTutorialButton')}
          </button>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsStep4PageTutorial;