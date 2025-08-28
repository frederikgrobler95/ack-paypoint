import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import MockQrScanner from '../../../../shared/ui/MockQrScanner';
import { useTranslation } from 'react-i18next';

function CheckoutStep1PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the checkout step 1 tutorial
  const checkoutStep1TutorialSteps = [
    {
      target: '.qr-scanner-section',
      content: t('tutorial.checkout.step1.qrScannerContent'),
      disableBeacon: true,
    },
    {
      target: '.scan-button',
      content: t('tutorial.checkout.step1.scanButtonContent'),
    },
    {
      target: '.manual-entry-button',
      content: t('tutorial.checkout.step1.manualEntryButtonContent'),
    },

  ];
  const { mockCheckoutData } = useTutorialStore();
  const { setCheckoutStepComplete } = useTutorialStore();
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
      if (mockCheckoutData.qrCode) {
        // Navigate to next step
        setCheckoutStepComplete(1);
        navigate('/tutorial/checkout/step2');
      } else {
        setError(t('tutorial.checkout.step1.error.invalidQrCode'));
      }
    } catch (err) {
      setError(t('tutorial.checkout.step1.error.scanFailed'));
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      // In tutorial mode, we'll accept any input
      setCheckoutStepComplete(1);
      navigate('/tutorial/checkout/step2');
    } else {
      setError(t('tutorial.checkout.step1.error.qrCodeRequired'));
    }
  };
  
  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={checkoutStep1TutorialSteps} />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
       
        {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
        {inputMethod === 'scan' && (
          <div className="qr-scanner-section mb-6">
            <MockQrScanner
              ref={mockQrScannerRef}
              onCodeScanned={(code) => {
                // In tutorial mode, we just navigate to the next step
                setCheckoutStepComplete(1);
                navigate('/tutorial/checkout/step2');
              }}
              isActive={true}
            />
            <button
              onClick={handleScanPress}
              className="scan-button mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('tutorial.checkout.step1.scanQrCodeButton')}
            </button>
            <button
              onClick={() => setInputMethod('manual')}
              className="manual-entry-button mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('tutorial.checkout.step1.enterManuallyButton')}
            </button>
          </div>
        )}
        
        {/* Manual Entry - Show only when inputMethod is 'manual' */}
        {inputMethod === 'manual' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">{t('tutorial.checkout.step1.manualEntryTitle')}</h3>
            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={qrCodeInput}
                onChange={(e) => {
                  setQrCodeInput(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                placeholder={t('tutorial.checkout.step1.qrCodeInputPlaceholder')}
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                {t('tutorial.checkout.step1.submitQrCodeButton')}
              </button>
              <button
                type="button"
                onClick={() => setInputMethod('scan')}
                className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
              >
                {t('tutorial.checkout.step1.backToScanButton')}
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

export default CheckoutStep1PageTutorial;