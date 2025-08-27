import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';
import { useQRCodeCustomer } from '../../../../queries/qrCodes';

function RegistrationStep2Page(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') || '';
  const phone = searchParams.get('phone') || '';
  
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  
  const { data: qrCodeData, isLoading: isQrCodeLoading, isError: isQrCodeError } = useQRCodeCustomer(qrCodeInput);
  
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
  React.useEffect(() => {
    if (qrCodeData) {
      // Valid QR code - navigate to step 3
      navigate(`/home/registration/step3?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(qrCodeData.qrCode.id)}`);
    } else if (isQrCodeError || (qrCodeInput && !isQrCodeLoading && !qrCodeData)) {
      // Invalid QR code
      setError('Invalid QR code. Please try again.');
    }
  }, [qrCodeData, isQrCodeError, qrCodeInput, isQrCodeLoading, navigate, name, phone]);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Registration - Step 2</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">QR Code Setup</h2>
        <p className="text-gray-600">Scan or enter the QR code to link to the customer's account.</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Customer Information</h3>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Name:</span>
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phone:</span>
          <span className="font-medium">{phone}</span>
        </div>
      </div>
      
      {/* QR Scanner */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Scan QR Code</h3>
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
      </div>
      
      {/* Manual Entry */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Or Enter Manually</h3>
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
        </form>
      </div>
      
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