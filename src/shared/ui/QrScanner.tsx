import React, { useEffect, useRef, useState } from 'react';

interface QrScannerProps {
  onCodeScanned: (data: string) => void;
  isActive?: boolean;
}

export interface QrScannerHandle {
  captureQRCode: () => Promise<string>;
}

const QrScanner = React.forwardRef<QrScannerHandle, QrScannerProps>((props, ref) => {
  const { onCodeScanned, isActive = true } = props;
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const initializeScanner = async () => {
      if (!isActive || !scannerRef.current) return;

      try {
        // Dynamically import html5-qrcode
        const module = await import('html5-qrcode');
        if (!isMounted) return;

        const Html5Qrcode = module.Html5Qrcode;
        
        // Check for camera availability
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setError('No camera devices found');
          return;
        }

        // Clean up any existing instance
        if (html5QrCodeRef.current) {
          try {
            await html5QrCodeRef.current.stop();
          } catch (e) {
            // Ignore cleanup errors
          }
          html5QrCodeRef.current = null;
        }

        // Create new scanner instance
        const scanner = new Html5Qrcode('qr-scanner-container');
        html5QrCodeRef.current = scanner;

        // Start the scanner in preview mode (no automatic scanning)
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          () => {
            // Empty success callback - prevents automatic scanning
          },
          () => {
            // Empty error callback - prevents error spam
          }
        );

        if (isMounted) {
          setIsInitialized(true);
          setError('');
        }
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err);
        if (isMounted) {
          setError('Failed to initialize camera');
          setIsInitialized(false);
        }
      }
    };

    initializeScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {
          // Ignore cleanup errors
        });
        html5QrCodeRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [isActive]);

  const captureQRCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!html5QrCodeRef.current || !isInitialized) {
        reject(new Error('Scanner not initialized'));
        return;
      }

      let scanCompleted = false;
      let timeoutId: NodeJS.Timeout;

      const cleanup = async () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        // Restart the scanner in preview mode
        try {
          if (html5QrCodeRef.current && html5QrCodeRef.current.getState() === 2) {
            await html5QrCodeRef.current.stop();
            await html5QrCodeRef.current.start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
              },
              () => {}, // Empty callback for preview mode
              () => {}
            );
          }
        } catch (e) {
          console.warn('Failed to restart scanner in preview mode:', e);
        }
      };

      // Set scan timeout
      timeoutId = setTimeout(async () => {
        if (!scanCompleted) {
          scanCompleted = true;
          await cleanup();
          reject(new Error('QR code scan timeout'));
        }
      }, 15000); // 15 second timeout

      // Stop current scanner and restart with scan callback
      html5QrCodeRef.current.stop().then(() => {
        if (scanCompleted || !html5QrCodeRef.current) {
          return;
        }

        // Start scanning with success callback
        html5QrCodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          async (decodedText: string) => {
            if (scanCompleted) return;
            
            scanCompleted = true;
            
            // Clean up and restart in preview mode
            await cleanup();
            
            // Notify parent component
            onCodeScanned(decodedText);
            resolve(decodedText);
          },
          () => {
            // Ignore scan errors - keep trying
          }
        ).catch(async (err: any) => {
          if (!scanCompleted) {
            scanCompleted = true;
            await cleanup();
            reject(new Error(`Failed to start scanning: ${err.message}`));
          }
        });
      }).catch(async (err: any) => {
        if (!scanCompleted) {
          scanCompleted = true;
          await cleanup();
          reject(new Error(`Failed to stop scanner: ${err.message}`));
        }
      });
    });
  };

  // Expose capture function to parent components
  React.useImperativeHandle(ref, () => ({
    captureQRCode
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg border-2 border-gray-300">
        <div className="text-red-600 text-center p-4">
          <p className="font-semibold">Camera Error</p>
          <p className="text-sm mt-2">{error}</p>
          <p className="text-xs mt-2 text-gray-500">
            Please ensure camera permissions are granted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div 
        id="qr-scanner-container" 
        ref={scannerRef}
        className="w-full max-w-md h-96 rounded-lg overflow-hidden border-2 border-gray-300 bg-black"
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Initializing camera...</p>
          </div>
        </div>
      )}
    </div>
  );
});

QrScanner.displayName = 'QrScanner';

export default QrScanner;