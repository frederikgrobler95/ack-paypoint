import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import MockQrScanner from '../../../../shared/ui/MockQrScanner';

// Define the steps for the sales step 1 tutorial
const salesStep1TutorialSteps = [
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

function SalesStep1PageTutorial() {
  const navigate = useNavigate();
  const { mockSalesData, setSalesStepComplete } = useTutorialStore();
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
      if (mockSalesData.qrCode) {
        // Navigate to next step
        setSalesStepComplete(1);
        navigate('/tutorial/sales/step2');
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
      setSalesStepComplete(1);
      navigate('/tutorial/sales/step2');
    } else {
      setError('Please enter a QR code');
    }
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={salesStep1TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
       
        
        {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
        {inputMethod === 'scan' && (
          <div className="qr-scanner-section mb-6">
            <MockQrScanner
              ref={mockQrScannerRef}
              onCodeScanned={(code) => {
                // In tutorial mode, we just navigate to the next step
                setSalesStepComplete(1);
                navigate('/tutorial/sales/step2');
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

export default SalesStep1PageTutorial;