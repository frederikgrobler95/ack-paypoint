import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowContainer } from '../../../../shared/ui';
import { TutorialTour } from '../../../../components/tutorial';
import { useTutorialStore } from '../../../../shared/stores/tutorialStore';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';
import MockQrScanner, { MockQrScannerHandle } from '../../../../shared/ui/MockQrScanner';
import { useTranslation } from 'react-i18next';

function RefundsStep1PageTutorial() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Define the steps for the refunds step 1 tutorial
  const refundsStep1TutorialSteps = [
    {
      target: '.qr-scanner-section',
      content: t('tutorial.refunds.step1.qrScannerContent'),
      disableBeacon: true,
      placement: 'bottom' as const,
    },
    {
      target: '.mock-qr-scanner',
      content: t('tutorial.refunds.step1.mockQrScannerContent'),
      placement: 'bottom' as const,
    },
    {
      target: '.scan-button',
      content: t('tutorial.refunds.step1.scanButtonContent'),
      placement: 'bottom' as const,
    },
  ];
  const { mockRefundsData } = useTutorialStore();
  const { setRefundsStepComplete } = useTutorialStore();
  
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  
  const handleScanPress = () => {
    // In tutorial mode, just show a success message and navigate to next step
    
    // Navigate to next step
    setRefundsStepComplete(1);
    navigate('/tutorial/refunds/step2');
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      // In tutorial mode, just show a success message and navigate to next step
      
      // Navigate to next step
      setRefundsStepComplete(1);
      navigate('/tutorial/refunds/step2');
    } else {
      setError(t('tutorial.refunds.step1.error.qrCodeRequired'));
    }
  };
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
      <TutorialTour steps={refundsStep1TutorialSteps} />
      
      {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
      {inputMethod === 'scan' && (
        <div className="qr-scanner-section bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('tutorial.refunds.step1.scanQrCodeTitle')}</h3>
          <div className="mock-qr-scanner">
            <MockQrScanner
              ref={qrScannerRef as React.RefObject<MockQrScannerHandle>}
              onCodeScanned={handleScanPress}
              isActive={true}
            />
          </div>
          <button
            onClick={handleScanPress}
            className="scan-button mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('tutorial.refunds.step1.scanQrCodeButton')}
          </button>
          <button
            onClick={() => setInputMethod('manual')}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('tutorial.refunds.step1.enterManuallyButton')}
          </button>
        </div>
      )}
      
      {/* Manual Entry - Show only when inputMethod is 'manual' */}
      {inputMethod === 'manual' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('tutorial.refunds.step1.manualEntryTitle')}</h3>
          <form onSubmit={handleManualSubmit}>
            <input
              type="text"
              value={qrCodeInput}
              onChange={(e) => {
                setQrCodeInput(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              placeholder={t('tutorial.refunds.step1.qrCodeInputPlaceholder')}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-neutral-50 font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('tutorial.refunds.step1.submitQrCodeButton')}
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('scan')}
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('tutorial.refunds.step1.backToScanButton')}
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