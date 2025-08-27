import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QrScanner, { QrScannerHandle } from '../../../shared/ui/QrScanner';

function ReissueQrCodeScreen(): React.JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const scannerRef = useRef<QrScannerHandle>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!scannerRef.current) return;
    
    setIsScanning(true);
    try {
      const code = await scannerRef.current.captureQRCode();
      setScannedCode(code);
    } catch (error) {
      console.error('Error scanning QR code:', error);
      alert(`Error scanning QR code: ${(error as Error).message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = () => {
    if (scannedCode && id) {
      // Navigate to the reissue page with the scanned code
      navigate(`/admin/customers/reissue-qr/${id}`, { 
        state: { newQrCodeId: scannedCode } 
      });
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Scan a new, unassigned QR code to link it to this customer.
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md mb-6">
            <QrScanner 
              ref={scannerRef}
              onCodeScanned={() => {}} // We're manually capturing, so this is empty
              isActive={true}
            />
          </div>
          
          {scannedCode ? (
            <div className="w-full max-w-md mb-6 p-4 bg-green-50 rounded-md">
              <p className="text-sm text-green-800 font-medium">Scanned QR Code:</p>
              <p className="text-xs text-green-700 font-mono mt-1 break-all">{scannedCode}</p>
            </div>
          ) : (
            <div className="w-full max-w-md mb-6 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Position the QR code within the scanner frame above to scan it.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            {!scannedCode ? (
              <button
                type="button"
                onClick={handleScan}
                disabled={isScanning}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Scan QR Code'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Confirm Reissue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReissueQrCodeScreen;