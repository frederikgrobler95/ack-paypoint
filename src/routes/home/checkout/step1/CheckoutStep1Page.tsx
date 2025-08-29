import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';
import { useQRCodeValidationForCheckout, useQRCodeValidationForCheckoutByLabel, useQRCodeCustomer } from '../../../../queries/qrCodes';
import { FlowContainer } from '@/shared/ui';
import { useFlowStore } from '@/shared/stores/flowStore';
import { useTranslation } from 'react-i18next';
import InfoDialog from '@/shared/ui/InfoDialog';

function CheckoutStep1Page(): React.JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { flowData } = useFlowStore();

  const [qrCodeInput, setQrCodeInput] = useState(flowData.qrCode || '');
  const [idempotencyKey, setIdempotencyKey] = useState(flowData.idempotencyKey || '');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  const [inputMethod, setInputMethod] = useState<'scan' | 'manual'>('scan');
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showNoBalanceDialog, setShowNoBalanceDialog] = useState(false);
  
  // For scanning, we validate by ID and by label
  const { data: qrCodeDataById, isLoading: isQrCodeLoadingById, isError: isQrCodeErrorById } = useQRCodeValidationForCheckout(qrCodeInput);
  const { data: qrCodeDataByLabel, isLoading: isQrCodeLoadingByLabel, isError: isQrCodeErrorByLabel } = useQRCodeValidationForCheckoutByLabel(qrCodeInput);
  
  // Fetch customer details after QR code validation
  const qrCodeData = qrCodeDataById || qrCodeDataByLabel;
  const { data: qrCodeCustomerData, isLoading: isQrCodeCustomerLoading, isError: isQrCodeCustomerError } = useQRCodeCustomer(qrCodeData?.id || '');
  
  // Use the appropriate data based on what's available
  const isQrCodeLoading = isQrCodeLoadingById || isQrCodeLoadingByLabel || isQrCodeCustomerLoading;
  const isQrCodeError = (isQrCodeErrorById && isQrCodeErrorByLabel) || isQrCodeCustomerError;
  
  // Reset QR code input when switching input methods
  React.useEffect(() => {
    setQrCodeInput('');
    setError('');
  }, [inputMethod]);
  
  useEffect(() => {
    if (!idempotencyKey) {
      setIdempotencyKey(`checkout_${uuidv4()}`);
    }
  }, [idempotencyKey]);

  const handleScanPress = async () => {
    if (qrScannerRef.current) {
      try {
        const scannedCode = await qrScannerRef.current.captureQRCode();
        validateQrCode(scannedCode);
      } catch (err) {
        setError(t('checkout.step1.error.scanFailed'));
      }
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      validateQrCode(qrCodeInput);
    } else {
      setError(t('checkout.step1.error.qrCodeRequired'));
    }
  };
  
  const validateQrCode = (code: string) => {
    // The useQRCodeValidationForCheckout hook will automatically validate the code
    // We just need to check the result
    setQrCodeInput(code);
    setError('');
  };
  
  // When qrCodeData changes, check if it's valid
  useEffect(() => {
    if (qrCodeData && qrCodeCustomerData && !hasNavigated && idempotencyKey) {
      // Check if customer has no outstanding balance
      if (qrCodeCustomerData.customer.Account.balanceCents === 0) {
        setShowNoBalanceDialog(true);
      } else {
        setHasNavigated(true);
        // Set flow data and mark step 1 as complete
        useFlowStore.getState().setFlowData({ step: 1, qrCode: qrCodeData.id, idempotencyKey });
        navigate('/checkout/step2');
      }
    } else if (isQrCodeError || (qrCodeInput && !isQrCodeLoading && !qrCodeData && !hasNavigated)) {
      setError(t('checkout.step1.error.invalidQrCode'));
    }
  }, [qrCodeData, qrCodeCustomerData, isQrCodeError, qrCodeInput, isQrCodeLoading, navigate, idempotencyKey, hasNavigated]);
  
  return (
    <FlowContainer withNoHeaderOffset withBottomOffset showCancelButton smallCancelButton>
      
      
      {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
      {inputMethod === 'scan' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('checkout.step1.scanQrCodeTitle')}</h3>
          <QrScanner
            ref={qrScannerRef}
            onCodeScanned={validateQrCode}
            isActive={true}
          />
          <button
            onClick={handleScanPress}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('checkout.step1.scanQrCodeButton')}
          </button>
          <button
            onClick={() => setInputMethod('manual')}
            className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
          >
            {t('checkout.step1.enterManuallyButton')}
          </button>
        </div>
      )}
      
      
      {/* Manual Entry - Show only when inputMethod is 'manual' */}
      {inputMethod === 'manual' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-3">{t('checkout.step1.manualEntryTitle')}</h3>
          <form onSubmit={handleManualSubmit}>
            <input
              type="text"
              value={qrCodeInput}
              onChange={(e) => {
                setQrCodeInput(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              placeholder={t('checkout.step1.qrCodeInputPlaceholder')}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('checkout.step1.submitQrCodeButton')}
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('scan')}
              className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md transition duration-200"
            >
              {t('checkout.step1.backToScanButton')}
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
          {t('checkout.step1.validatingQrCode')}
        </div>
      )}
      
      {/* No outstanding balance dialog */}
      {showNoBalanceDialog && (
        <InfoDialog
          title={t('checkout.step2.noOutstandingAmountTitle')}
          message={t('checkout.step2.noOutstandingAmountMessage')}
          onConfirm={() => navigate('/')}
        />
      )}
    </FlowContainer>
  );
}

export default CheckoutStep1Page;