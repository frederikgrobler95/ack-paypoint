import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQRCodeCustomer } from '../../../../queries/qrCodes';
import QrScanner, { QrScannerHandle } from '../../../../shared/ui/QrScanner';

function SalesStep1Page(): React.JSX.Element {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const qrScannerRef = useRef<QrScannerHandle>(null);
  
  // Query hook for QR code validation (only enabled when we have a code to check)
  const { data: qrData, isLoading, isError, error: queryError, refetch } = useQRCodeCustomer(manualCode);

  // Handle QR code scanned from scanner
  const handleCodeScanned = async (data: string) => {
    try {
      setManualCode(data);
      // Validate the QR code by triggering the query
      const result = await refetch();
      
      if (result.data) {
        // Valid QR code, navigate to step 2
        navigate(`/home/sales/step2?code=${encodeURIComponent(data)}`);
      } else {
        // Invalid QR code
        setError('Invalid QR code. Please try again.');
      }
    } catch (err) {
      setError('Error validating QR code. Please try again.');
    }
  };

  // Handle manual code submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      setError('Please enter a QR code');
      return;
    }
    
    try {
      setError('');
      // Validate the QR code by triggering the query
      const result = await refetch();
      
      if (result.data) {
        // Valid QR code, navigate to step 2
        navigate(`/home/sales/step2?code=${encodeURIComponent(manualCode)}`);
      } else {
        // Invalid QR code
        setError('Invalid QR code. Please try again.');
      }
    } catch (err) {
      setError('Error validating QR code. Please try again.');
    }
  };

  // Handle scan button click
  const handleScanClick = async () => {
    if (qrScannerRef.current) {
      try {
        const code = await qrScannerRef.current.captureQRCode();
        handleCodeScanned(code);
      } catch (err) {
        setError('Failed to scan QR code. Please try again.');
      }
    }
  };

  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sales - Step 1</h1>
        <p className="text-gray-600 mb-6">Scan or enter a QR code to begin a sale transaction.</p>
        
        {/* QR Scanner */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Scan QR Code</h2>
          <div className="flex flex-col items-center">
            <QrScanner 
              ref={qrScannerRef}
              onCodeScanned={handleCodeScanned}
              isActive={true}
            />
            <button
              onClick={handleScanClick}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Scan QR Code
            </button>
          </div>
        </div>
        
        {/* Manual Entry */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Or Enter Code Manually</h2>
          <form onSubmit={handleManualSubmit}>
            <div className="mb-4">
              <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700 mb-1">
                QR Code
              </label>
              <input
                type="text"
                id="qrCode"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter QR code"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
              Validate QR Code
            </button>
          </form>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-md">
            Validating QR code...
          </div>
        )}
      </div>
    </>
  );
}

export default SalesStep1Page;