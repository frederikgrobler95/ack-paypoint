import React, { useEffect, useRef } from 'react';

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

  useEffect(() => {
    if (!isActive || !scannerRef.current) return;

    // Dynamically import html5-qrcode to avoid SSR issues
    import('html5-qrcode').then((module) => {
      const Html5Qrcode = module.Html5Qrcode;
      
      // Clean up previous instance if exists
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }

      // Create new instance
      const html5QrCode = new Html5Qrcode('qr-scanner-container');
      html5QrCodeRef.current = html5QrCode;

      // Start camera preview without scanning
      // Empty success callback prevents auto-capture
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        () => {}, // Empty success callback to prevent auto-capture
        () => {}  // Error callback
      ).catch((err) => {
        console.error('Failed to start QR scanner:', err);
      });
    });

    // Cleanup function
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [isActive]);

  // Function to manually capture QR code
  const captureQRCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!html5QrCodeRef.current) {
        reject(new Error('Scanner not initialized'));
        return;
      }

      let captureCompleted = false;
      
      // Set timeout for scanning
      const timeoutId = setTimeout(() => {
        if (!captureCompleted) {
          captureCompleted = true;
          reject(new Error('QR code scan timeout'));
        }
      }, 10000); // 10 second timeout

      // Stop preview and start scanning
      html5QrCodeRef.current.stop().then(() => {
        if (!html5QrCodeRef.current) {
          clearTimeout(timeoutId);
          if (!captureCompleted) {
            captureCompleted = true;
            reject(new Error('Scanner not initialized'));
          }
          return;
        }

        // Start scanning with success callback
        html5QrCodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText: string) => {
            // First successful scan - stop scanning and return to preview
            if (captureCompleted) return;
            captureCompleted = true;
            clearTimeout(timeoutId);
            
            // Stop scanning
            html5QrCodeRef.current.stop().then(() => {
              // Return to preview mode (no auto-capture)
              if (html5QrCodeRef.current) {
                html5QrCodeRef.current.start(
                  { facingMode: "environment" },
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                  },
                  () => {}, // Empty callback for preview mode
                  () => {}
                ).catch(() => {});
              }
            }).catch(() => {
              // If we can't restart preview, still resolve the scan
              if (html5QrCodeRef.current) {
                html5QrCodeRef.current.start(
                  { facingMode: "environment" },
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                  },
                  () => {},
                  () => {}
                ).catch(() => {});
              }
            });
            
            // Notify parent and resolve promise
            onCodeScanned(decodedText);
            resolve(decodedText);
          },
          () => {} // Ignore scan failures
        ).catch((err: any) => {
          clearTimeout(timeoutId);
          if (!captureCompleted) {
            captureCompleted = true;
            // Try to return to preview mode
            if (html5QrCodeRef.current) {
              html5QrCodeRef.current.start(
                { facingMode: "environment" },
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 }
                },
                () => {},
                () => {}
              ).catch(() => {});
            }
            reject(new Error(`Failed to start scanning: ${err}`));
          }
        });
      }).catch((err: any) => {
        clearTimeout(timeoutId);
        if (!captureCompleted) {
          captureCompleted = true;
          reject(new Error(`Failed to stop scanner: ${err}`));
        }
      });
    });
  };

  // Expose capture function to parent components
  React.useImperativeHandle(ref, () => ({
    captureQRCode
  }));

  return (
    <div className="flex flex-col items-center">
      <div 
        id="qr-scanner-container" 
        ref={scannerRef}
        className="w-full max-w-md h-64 rounded-lg overflow-hidden border-2 border-gray-300"
      />
    </div>
  );
});

export default QrScanner;