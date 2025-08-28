import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import { useTutorialNavigation } from '../../../../hooks';
import { useToast } from '../../../../contexts/ToastContext';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';
import MockQrScanner, { MockQrScannerHandle } from '../../../../shared/ui/MockQrScanner';

// Define the steps for the refunds step 1 tutorial
const refundsStep1TutorialSteps = [
  {
    target: '.qr-scanner-section',
    content: 'After clicking the refunds link from the header dropdown, you\'ll be taken to the scan QR code page.',
    disableBeacon: true,
    placement: 'bottom' as const,
  },
  {
    target: '.mock-qr-scanner',
    content: 'You can either scan the customer\'s QR code or enter it manually if scanning is not possible.',
    placement: 'bottom' as const,
  },
  {
    target: '.scan-button',
    content: 'Click this button to simulate scanning the customer\'s QR code.',
    placement: 'bottom' as const,
  },
];

function RefundsStep1PageTutorial() {
  const navigate = useNavigate();
  const { mockRefundsData } = useTutorialStore();
  const { navigateToNextTutorialStep, exitTutorial } = useTutorialNavigation();
  const { showToast } = useToast();
  
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  
  const handleScanPress = () => {
    // In tutorial mode, just show a success message and navigate to next step
    showToast('QR Code scanned successfully', 'success');
    
    // Navigate to next step
    navigateToNextTutorialStep(location.pathname);
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      // In tutorial mode, just show a success message and navigate to next step
      showToast('QR Code submitted successfully', 'success');
      
      // Navigate to next step
      navigateToNextTutorialStep(location.pathname);
    } else {
      setError('Please enter a QR code');
    }
  };
  
  return (
    <FlowContainer withHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep1TutorialSteps} />
      
      {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
      {inputMethod === 'scan' && (
        <div className="qr-scanner-section bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Scan QR Code</h3>
          <div className="mock-qr-scanner">
            <MockQrScanner
              ref={qrScannerRef as React.RefObject<MockQrScannerHandle>}
              onCodeScanned={handleScanPress}
              isActive={true}
            />
          </div>
          <button
            onClick={handleScanPress}
            className="scan-button mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            Scan QR Code
          </button>
          <button
            onClick={() => setInputMethod('manual')}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
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
      
      {/* Info Section */}
      
    </FlowContainer>
  );
}

export default RefundsStep1PageTutorial;