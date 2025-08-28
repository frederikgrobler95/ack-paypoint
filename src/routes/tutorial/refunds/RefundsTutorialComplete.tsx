import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../shared/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { useTranslation } from 'react-i18next';

function RefundsTutorialComplete() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    resetRefundsTutorial,
    setCurrentTutorial,
    setCurrentStep,
    markTutorialAsCompleted
  } = useTutorialStore();

  const handleRestartTutorial = async () => {
    try {
      // Reset the tutorial store state
      resetRefundsTutorial();
      setCurrentTutorial('sales');
      setCurrentStep(1);
      
      // Navigate to the first step of sales tutorial
      navigate('/tutorial/sales');
    } catch (error) {
      console.error('Error restarting tutorial:', error);
    }
  };

  const handleCompleteTutorial = () => {
    // Mark tutorial as completed and exit tutorial mode
    markTutorialAsCompleted('refunds');
    navigate('/');
  };

  return (
    <FlowContainer withNoHeaderOffset>
      <div className=" bg-gray-50 flex flex-col justify-center  px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('tutorial.refunds.complete.title')}
            </h1>
            
            {/* Description */}
            <p className="text-gray-600 mb-6">
              {t('tutorial.refunds.complete.congratulationsMessage')}
              {t('tutorial.refunds.complete.knowledgeConfirmation')}
            </p>
            
      
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleCompleteTutorial}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('tutorial.refunds.complete.completeAndExitButton')}
              </button>
              
      
            </div>
            
            {/* Additional Info */}
           
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RefundsTutorialComplete;