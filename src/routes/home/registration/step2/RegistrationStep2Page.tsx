import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';
import { useQRCodeValidationForRegistration, useQRCodeValidationForRegistrationByLabel } from '../../../../queries/qrCodes';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
function RegistrationStep2Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { flowData } = useFlowStore();
  
  // Data from previous step
  const { name, phone, idempotencyKey } = flowData || {};
  
  
  const [qrCodeInput, setQrCodeInput] = useState(flowData?.qrCodeId || '');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  const [hasNavigated, setHasNavigated] = useState(false);
  
  // For scanning, we validate by ID
  const { data: qrCodeDataById, isLoading: isQrCodeLoadingById, isError: isQrCodeErrorById } = useQRCodeValidationForRegistration(qrCodeInput);
  
  // For manual entry, we validate by label
  const { data: qrCodeDataByLabel, isLoading: isQrCodeLoadingByLabel, isError: isQrCodeErrorByLabel } = useQRCodeValidationForRegistrationByLabel(qrCodeInput);
  
  // Use the appropriate data based on input method
  const qrCodeData = inputMethod === 'scan' ? qrCodeDataById : qrCodeDataByLabel;
  const isQrCodeLoading = inputMethod === 'scan' ? isQrCodeLoadingById : isQrCodeLoadingByLabel;
  const isQrCodeError = inputMethod === 'scan' ? isQrCodeErrorById : isQrCodeErrorByLabel;
  
  // Reset QR code input when switching input methods
  React.useEffect(() => {
    setQrCodeInput('');
    setError('');
  }, [inputMethod]);
  
  const handleScanPress = async () => {
    if (qrScannerRef.current) {
      try {
        const scannedCode = await qrScannerRef.current.captureQRCode();
        validateQrCode(scannedCode);
      } catch (err) {
        setError(t('registration.step2.scanFailed'));
      }
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      validateQrCode(qrCodeInput);
    } else {
      setError(t('registration.step2.enterQrCode'));
    }
  };
  
  const validateQrCode = (code: string) => {
    // The useQRCodeCustomer hook will automatically validate the code
    // We just need to check the result
    setQrCodeInput(code);
    setError('');
  };
  
  // When qrCodeData changes, check if it's valid
  useEffect(() => {
    if (qrCodeData && !hasNavigated && name && phone && idempotencyKey) {
      setHasNavigated(true);
      // Mark step 2 as complete
      useFlowStore.getState().setFlowData({ step: 2, qrCodeId: qrCodeData.id, qrCodeLabel: qrCodeData.label });
      navigate('/registration/step3');
    } else if (isQrCodeError || (qrCodeInput && !isQrCodeLoading && !qrCodeData && !hasNavigated)) {
      setError(t('registration.step2.invalidQrCode'));
    }
  }, [qrCodeData, isQrCodeError, qrCodeInput, isQrCodeLoading, navigate, name, phone, idempotencyKey, hasNavigated]);
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton>
      
      {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
      {inputMethod === 'scan' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          
        
            <QrScanner
              ref={qrScannerRef}
              onCodeScanned={validateQrCode}
              isActive={true}
            />
         
          <button
            onClick={handleScanPress}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('registration.step2.scanQrCode')}
          </button>
          <button
            onClick={() => setInputMethod('manual')}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('registration.step2.enterManually')}
          </button>
        </div>
      )}
      
      
      {/* Manual Entry - Show only when inputMethod is 'manual' */}
      {inputMethod === 'manual' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('registration.step2.enterQrCodeManually')}</h3>
          <form onSubmit={handleManualSubmit}>
            <input
              type="text"
              value={qrCodeInput}
              onChange={(e) => {
                setQrCodeInput(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              placeholder={t('registration.step2.placeholder.enterQrCode')}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('registration.step2.submitQrCode')}
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('scan')}
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('registration.step2.backToScan')}
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
      
      {/* Loading indicator */}
      {isQrCodeLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          {t('registration.step2.validating')}
        </div>
      )}
    </FlowContainer>
  );
}

export default RegistrationStep2Page;