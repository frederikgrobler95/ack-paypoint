import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import QrScanner, { QrScannerHandle } from '../../../../../shared/ui/QrScanner';
import { useQRCodeValidationForSales, useQRCodeValidationForSalesByLabel } from '../../../../../queries/qrCodes';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
function RefundsStep1Page(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [qrCodeInput, setQrCodeInput] = useState(location.state?.qrCode || '');
  const [idempotencyKey, setIdempotencyKey] = useState(location.state?.idempotencyKey || '');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  const [hasNavigated, setHasNavigated] = useState(false);
  const [isManualSubmit, setIsManualSubmit] = useState(false);
  
  // For scanning, we validate by ID and by label
  const { data: qrCodeDataById, isLoading: isQrCodeLoadingById, isError: isQrCodeErrorById } = useQRCodeValidationForSales(qrCodeInput);
  const { data: qrCodeDataByLabel, isLoading: isQrCodeLoadingByLabel, isError: isQrCodeErrorByLabel } = useQRCodeValidationForSalesByLabel(qrCodeInput);
  
  // Use the appropriate data based on what's available
  const qrCodeData = qrCodeDataById || qrCodeDataByLabel;
  const isQrCodeLoading = isQrCodeLoadingById || isQrCodeLoadingByLabel;
  const isQrCodeError = isQrCodeErrorById && isQrCodeErrorByLabel;
  
  // Reset QR code input when switching input methods
  React.useEffect(() => {
    setQrCodeInput('');
    setError('');
  }, [inputMethod]);
  
  useEffect(() => {
    if (!idempotencyKey) {
      setIdempotencyKey(`refund_${uuidv4()}`);
    }
  }, [idempotencyKey]);

  const handleScanPress = async () => {
    if (qrScannerRef.current) {
      try {
        const scannedCode = await qrScannerRef.current.captureQRCode();
        validateQrCode(scannedCode, false);
      } catch (err) {
        setError(t('refundsStep1.failedToScan'));
      }
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      validateQrCode(qrCodeInput, true);
    } else {
      setError(t('refundsStep1.pleaseEnterQrCode'));
    }
  };
  
  const validateQrCode = (code: string, isManual = false) => {
    // The useQRCodeValidationForSales hook will automatically validate the code
    // We just need to check the result
    setQrCodeInput(code);
    setError('');
    if (isManual) {
      setIsManualSubmit(true);
    }
  };
  
  // When qrCodeData changes, check if it's valid
  useEffect(() => {
    if (qrCodeData && !hasNavigated && idempotencyKey) {
      // For scanned codes, navigate automatically
      // For manually entered codes, only navigate after explicit submission
      if (inputMethod === 'scan' || (inputMethod === 'manual' && isManualSubmit)) {
        setHasNavigated(true);
        setIsManualSubmit(false); // Reset the flag
        // Set flow data and mark step 1 as complete
        useFlowStore.getState().setFlowData({ step: 1, qrCode: qrCodeData.id, idempotencyKey });
        navigate('/sales/refunds/refundsstep2', {
          state: {
            qrCode: qrCodeData.id,
            idempotencyKey,
          }
        });
      }
    } else if (isQrCodeError || (qrCodeInput && !isQrCodeLoading && !qrCodeData && !hasNavigated)) {
      setError(t('refundsStep1.invalidQrCode'));
      setIsManualSubmit(false); // Reset the flag on error
    }
  }, [qrCodeData, isQrCodeError, qrCodeInput, isQrCodeLoading, navigate, idempotencyKey, hasNavigated, inputMethod, isManualSubmit]);
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset>
    
      
      {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
      {inputMethod === 'scan' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('refundsStep1.scanQrCode')}</h3>
            <QrScanner
              ref={qrScannerRef}
              onCodeScanned={(code) => validateQrCode(code, false)}
              isActive={true}
            />
          <button
            onClick={handleScanPress}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('refundsStep1.scanQrCode')}
          </button>
          <button
            onClick={() => setInputMethod('manual')}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('refundsStep1.enterManually')}
          </button>
        </div>
      )}
      
      
      {/* Manual Entry - Show only when inputMethod is 'manual' */}
      {inputMethod === 'manual' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('refundsStep1.enterQrCodeManually')}</h3>
          <form onSubmit={handleManualSubmit}>
            <input
              type="text"
              value={qrCodeInput}
              onChange={(e) => {
                setQrCodeInput(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              placeholder={t('refundsStep1.enterQrCodePlaceholder')}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            >
            {t('refundsStep1.submitQrCode')}
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('scan')}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('refundsStep1.backToScan')}
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
        {t('refundsStep1.validatingQrCode')}
      </div>
    )}
    </FlowContainer>
  );
}

export default RefundsStep1Page;