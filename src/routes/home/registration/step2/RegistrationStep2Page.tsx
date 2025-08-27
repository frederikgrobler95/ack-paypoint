import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';
import { useQRCodeValidationForRegistration, useQRCodeValidationForRegistrationByLabel } from '../../../../queries/qrCodes';

function RegistrationStep2Page(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();

  // Data from previous step
  const { name, phone, idempotencyKey } = location.state || {};
  
  const [qrCodeInput, setQrCodeInput] = useState(location.state?.qrCodeId || '');
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
        setError('Failed to scan QR code. Please try again.');
      }
    }
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCodeInput.trim()) {
      validateQrCode(qrCodeInput);
    } else {
      setError('Please enter a QR code');
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
      navigate('/registration/step3', {
        state: {
          name,
          phone,
          idempotencyKey,
          qrCodeId: qrCodeData.id,
          qrCodeLabel: qrCodeData.label,
        }
      });
    } else if (isQrCodeError || (qrCodeInput && !isQrCodeLoading && !qrCodeData && !hasNavigated)) {
      setError('Invalid QR code. Please try again.');
    }
  }, [qrCodeData, isQrCodeError, qrCodeInput, isQrCodeLoading, navigate, name, phone, idempotencyKey, hasNavigated]);
  
  return (
    <div className="p-4">
      
      {/* QR Scanner Section - Show only when inputMethod is 'scan' */}
      {inputMethod === 'scan' && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          
          <QrScanner
            ref={qrScannerRef}
            onCodeScanned={validateQrCode}
            isActive={true}
          />
          <button
            onClick={handleScanPress}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
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
      
      {/* Loading indicator */}
      {isQrCodeLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          Validating QR code...
        </div>
      )}
    </div>
  );
}

export default RegistrationStep2Page;