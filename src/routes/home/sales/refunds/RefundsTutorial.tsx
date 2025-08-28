import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '@/shared/ui';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorial } from '../../../../hooks/useTutorial';

function RefundsTutorial() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { markTutorialAsCompleted } = useTutorialStore();
  const { updateTutorialStatus, markTutorialCompleted } = useTutorial();

  const handleStartTutorial = () => {
    // Navigate to the first step of the checkout tutorial
    navigate('/tutorial/checkout/step1');
  };

  const handleCompleteAllTutorials = async () => {
    // Mark all tutorials as completed
    await markTutorialCompleted(); // This marks all tutorials as completed
    markTutorialAsCompleted(); // This marks the tutorial flow as completed in the store
    // Navigate back to the main app
    navigate('/');
  };

  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('refundsTutorial.title')}</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{t('refundsTutorial.overview')}</h2>
          <p className="text-gray-600 mb-4">
            {t('refundsTutorial.description')}
          </p>
          <p className="text-gray-600 mb-4">
            {t('refundsTutorial.learnHowTo')}
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>{t('refundsTutorial.scanQrCode')}</li>
            <li>{t('refundsTutorial.selectTransaction')}</li>
            <li>{t('refundsTutorial.processRefund')}</li>
            <li>{t('refundsTutorial.viewReceipt')}</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('refundsTutorial.steps')}</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ol className="list-decimal list-inside space-y-2">
              <li className="text-gray-700">{t('refundsTutorial.scanQrCode')}</li>
              <li className="text-gray-700">{t('refundsTutorial.selectTransaction')}</li>
              <li className="text-gray-700">{t('refundsTutorial.processRefund')}</li>
              <li className="text-gray-700">{t('refundsTutorial.viewReceipt')}</li>
            </ol>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('refundsTutorial.backToHome')}
          </button>
          
          <div className="space-x-2">
            <button
              onClick={handleCompleteAllTutorials}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {t('refundsTutorial.skipAllTutorials')}
            </button>
            
            <button
              onClick={handleStartTutorial}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('refundsTutorial.startTutorial')}
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsTutorial;