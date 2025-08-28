import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';
import MockQrScanner from '../../../../shared/ui/MockQrScanner';

// Define the steps for the registration step 2 tutorial
const registrationStep2TutorialSteps = [
  {
    target: '.qr-scanner-section',
    content: 'This is the QR scanner section. In tutorial mode, it shows a mock scanner.',
    disableBeacon: true,
  },
  {
    target: '.scan-button',
    content: 'Click this button to simulate scanning a QR code.',
  },
  {
    target: '.manual-entry-button',
    content: 'You can also enter QR codes manually by clicking here.',
  },
  
];

function RegistrationStep2PageTutorial() {
  const navigate = useNavigate();
  const { mockRegistrationData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [error, setError] = useState('');
  const mockQrScannerRef = useRef<any>(null);
  
  const handleScanPress = async () => {
    // In tutorial mode, we'll simulate a successful scan
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate QR code (in tutorial, we just accept the mock QR code)
      if (mockRegistrationData.qrCode) {
        // Navigate to next step
        navigateToNextTutorialStep('/tutorial/registration/step2');
      } else {
        setError('Invalid QR code. Please try again.');
      }
    } catch (err) {
      setError('Failed to scan QR code. Please try again.');
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      // In tutorial mode, we'll accept any input
      navigateToNextTutorialStep('/tutorial/registration/step2');
    } else {
      setError('Please enter a QR code');
    }
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={registrationStep2TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration Tutorial - Step 2: Scan QR Code</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tutorial Instructions</h2>
          <p className="text-gray-600 mb-4">
            In this step, you'll learn how to scan a QR code for the customer registration.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <span className="font-medium">Tip:</span> Follow the guided tour instructions to learn how to use this page.
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Mock Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Customer:</span> {mockRegistrationData.customerName}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Phone:</span> {mockRegistrationData.customerPhone}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">QR Code:</span> {mockRegistrationData.qrCode}
            </p>
          </div>
        </div> */}
        
        {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
        {inputMethod === 'scan' && (
          <div className="qr-scanner-section mb-6">
            <MockQrScanner
              ref={mockQrScannerRef}
              onCodeScanned={(code) => {
                // In tutorial mode, we just navigate to the next step
                navigateToNextTutorialStep('/tutorial/registration/step2');
              }}
              isActive={true}
            />
            <button
              onClick={handleScanPress}
              className="scan-button mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              Scan QR Code
            </button>
            <button
              onClick={() => setInputMethod('manual')}
              className="manual-entry-button mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              Enter Manually
            </button>
          </div>
        )}
        
        {/* Manual Entry - Show only when inputMethod is 'manual' */}
        {inputMethod === 'manual' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Enter QR Code Manually</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={qrCodeInput}
                onChange={(e) => {
                  setQrCodeInput(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                placeholder="Enter QR code"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Submit QR Code
              </button>
              <button
                type="button"
                onClick={() => setInputMethod('scan')}
                className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                Back to Scan
              </button>
            </form>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* Tutorial Navigation */}
      
    </FlowContainer>
  );
}

export default RegistrationStep2PageTutorial;