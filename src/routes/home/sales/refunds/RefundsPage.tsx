import React from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';


function RefundsPage(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const handleStartRefund = () => {
    // Reset the refunds flow when starting a new refund
    useFlowStore.getState().resetRefundsFlow();
    navigate('/sales/refunds/refundsstep1');
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('refunds.title')}</h1>
        <p className="text-gray-600 mb-8 text-center">
          {t('refunds.description')}
        </p>
        <button
          onClick={handleStartRefund}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          {t('refunds.startProcess')}
        </button>
      </div>
    </FlowContainer>
  )
}

export default RefundsPage