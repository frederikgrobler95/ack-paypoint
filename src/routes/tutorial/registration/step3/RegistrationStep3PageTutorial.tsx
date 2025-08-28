import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';

// Define the steps for the registration step 3 tutorial
const registrationStep3TutorialSteps = [
  {
    target: '.customer-details',
    content: 'This section shows the customer details you entered.',
    disableBeacon: true,
  },
  {
    target: '.qr-code-display',
    content: 'This is the QR code that has been assigned to the customer.',
  },
  {
    target: '.confirm-button',
    content: 'Click this button to confirm and complete the registration.',
  },
  {
    target: '.tutorial-navigation',
    content: 'Use these buttons to navigate between tutorial steps or exit the tutorial.',
  },
];

function RegistrationStep3PageTutorial() {
  const navigate = useNavigate();
  const { mockRegistrationData, setRegistrationTutorialCompleted } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  
  const handleConfirmRegistration = () => {
    // In tutorial mode, just show a success message and complete the tutorial
    // Navigate to next step (which will complete the tutorial)
    navigateToNextTutorialStep('/tutorial/registration/step3');
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={registrationStep3TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration Tutorial - Step 3: Confirm Registration</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to confirm a customer registration and view the QR code.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div>
        
        <div className="mb-6 customer-details">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock Registration Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Customer:</span> {mockRegistrationData.customerName}
            </p>
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Phone:</span> {mockRegistrationData.customerPhone}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {mockRegistrationData.customerEmail}
            </p>
          </div>
        </div>
        
        <div className="mb-6 qr-code-display">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Customer QR Code</h3>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
            <div className="mr-4">
              <QRCodeCanvas value={mockRegistrationData.qrCode} size={128} />
            </div>
            <p className="text-lg font-bold text-gray-900">{mockRegistrationData.qrCode}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Confirm Registration</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium">{mockRegistrationData.customerName}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{mockRegistrationData.customerPhone}</span>
            </div>
          </div>
          
          <button
            onClick={handleConfirmRegistration}
            className="confirm-button w-full py-3 px-4 rounded-md font-semibold text-white transition duration-200 bg-green-600 hover:bg-green-700"
          >
            Confirm Registration
          </button>
        </div>
      </div>
      
      {/* Tutorial Navigation */}
      <div className="fixed bottom-4 left-0 right-0 bg-white p-4 border-t border-gray-200 tutorial-navigation">
        <div className="flex justify-between">
          <button
            onClick={exitTutorial}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Exit Tutorial
          </button>
          
          <div className="space-x-2">
            <button
              onClick={() => navigate('/tutorial/registration/step2')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            
            <button
              onClick={() => navigateToNextTutorialStep('/tutorial/registration/step3')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Complete Tutorial
            </button>
          </div>
        </div>
      </div>
    </FlowContainer>
  );
}

export default RegistrationStep3PageTutorial;