import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../shared/ui';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';

function CheckoutTutorialComplete() {
  const navigate = useNavigate();
  const {
    resetCheckoutTutorial,
    setCurrentTutorial,
    setCurrentStep
  } = useTutorialStore();

  const handleRestartTutorial = () => {
    // Reset the checkout tutorial progress
    resetCheckoutTutorial();
    
    // Set up the tutorial state
    setCurrentTutorial('checkout');
    setCurrentStep(1);
    
    // Navigate to the first step
    navigate('/tutorial/checkout/step1');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <FlowContainer withNoHeaderOffset>
      <div className="bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              Checkout Tutorial Complete!
            </h1>
            
            {/* Description */}
            <p className="text-gray-600 mb-8">
              Congratulations! You've successfully completed the checkout tutorial. 
              You now know how to process customer checkouts and handle payment transactions.
            </p>
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleRestartTutorial}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restart Tutorial
              </button>
              
              {/* <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home
              </button> */}
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

export default CheckoutTutorialComplete;