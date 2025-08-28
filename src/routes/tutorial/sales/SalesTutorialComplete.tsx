import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../shared/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';

function SalesTutorialComplete() {
  const navigate = useNavigate();
  const {
    resetSalesTutorial,
    setCurrentTutorial,
    setCurrentStep
  } = useTutorialStore();

  const handleRestartTutorial = async () => {
    try {
      // Reset the tutorial store state
      resetSalesTutorial();
      setCurrentTutorial('sales');
      setCurrentStep(1);
      
      // Navigate to the first step
      navigate('/tutorial/sales');
    } catch (error) {
      console.error('Error restarting tutorial:', error);
    }
  };

  const handleContinueToRefunds = () => {
    // Set up the refunds tutorial
    setCurrentTutorial('refunds');
    setCurrentStep(0);
    
    // Navigate to the refunds tutorial
    navigate('/tutorial/refunds');
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
              Sales Tutorial Complete!
            </h1>
            
            {/* Description */}
            <p className="text-gray-600 mb-6">
              Congratulations! You've successfully completed the sales tutorial.
              You now know how to process sales transactions and handle customer payments.
            </p>
            
            {/* Next Tutorial Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Next: Learn Refunds
              </h3>
              <p className="text-blue-700 text-sm">
                Continue your training by learning how to process refunds. This tutorial will show you how to handle refund requests from the header menu.
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleContinueToRefunds}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Continue to Refunds Tutorial
              </button>
              
              <button
                onClick={handleRestartTutorial}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restart Sales Tutorial
              </button>
            </div>
            
            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                You can always restart this tutorial later from the settings menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default SalesTutorialComplete;