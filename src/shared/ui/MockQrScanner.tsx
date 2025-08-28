import React, { useState } from 'react';
import { useTutorialStore } from '../../shared/stores/tutorialStore';

interface MockQrScannerProps {
  onCodeScanned: (data: string) => void;
  isActive?: boolean;
}

export interface MockQrScannerHandle {
  captureQRCode: () => Promise<string>;
}

const MockQrScanner = React.forwardRef<MockQrScannerHandle, MockQrScannerProps>((props, ref) => {
  const { onCodeScanned, isActive = true } = props;
  const { mockData } = useTutorialStore();
  const [isScanning, setIsScanning] = useState(false);

  const captureQRCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isActive) {
        reject(new Error('Scanner not active'));
        return;
      }

      setIsScanning(true);

      // Simulate scanning delay
      setTimeout(() => {
        setIsScanning(false);
        
        // Use mock QR code data from tutorial store
        const mockQrCode = mockData.sales.qrCode;
        onCodeScanned(mockQrCode);
        resolve(mockQrCode);
      }, 1000);
    });
  };

  // Expose capture function to parent components
  React.useImperativeHandle(ref, () => ({
    captureQRCode
  }));

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md h-96 rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100 flex flex-col items-center justify-center">
        <div className="text-center p-6">
          <div className="mb-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-64 h-64 mx-auto flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-600 font-medium">Mock QR Scanner</p>
                <p className="text-gray-500 text-sm mt-1">Tutorial Mode</p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            In tutorial mode, this scanner simulates scanning a QR code.
          </p>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Mock QR Code:</span> {mockData.sales.qrCode}
            </p>
          </div>
        </div>
      </div>
      
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></div>
            <p className="text-white font-medium">Scanning...</p>
          </div>
        </div>
      )}
    </div>
  );
});

MockQrScanner.displayName = 'MockQrScanner';

export default MockQrScanner;