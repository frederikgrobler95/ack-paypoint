import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../shared/ui';
import { useTutorialStore } from '../../../shared/stores/tutorialStore';
import { useTutorial } from '../../../hooks/useTutorial';

function RegistrationTutorial() {
  const navigate = useNavigate();
  const { markTutorialAsCompleted } = useTutorialStore();
  const { updateTutorialStatus, markTutorialCompleted } = useTutorial();

  const handleStartTutorial = () => {
    // Navigate to the first step of the registration tutorial
    navigate('/tutorial/registration/step1');
  };

  const handleCompleteAllTutorials = async () => {
    // Mark all tutorials as completed
    await markTutorialCompleted(); // This marks all tutorials as completed
    markTutorialAsCompleted(); // This marks the tutorial flow as completed in the store
    // Navigate back to the main app
    navigate('/');
  };

  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration Tutorial</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Overview</h2>
          <p className="text-gray-600 mb-4">
            This tutorial will guide you through the process of registering a new customer in the system.
          </p>
          <p className="text-gray-600 mb-4">
            You'll learn how to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4">
            <li>Enter customer details</li>
            <li>Scan or enter a QR code for the customer</li>
            <li>Complete the registration process</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Steps</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <ol className="list-decimal list-inside space-y-2">
              <li className="text-gray-700">Enter Customer Details</li>
              <li className="text-gray-700">Scan/Enter QR Code</li>
              <li className="text-gray-700">Complete Registration</li>
            </ol>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </button>
          
          <div className="space-x-2">
            <button
              onClick={handleCompleteAllTutorials}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Skip All Tutorials
            </button>
            
            <button
              onClick={handleStartTutorial}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start Tutorial
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RegistrationTutorial;