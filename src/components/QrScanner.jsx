import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const QrScanner = ({ onScanSuccess, isPaused }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const isComponentMounted = useRef(true);
  const qrcodeRegionId = "html5qr-code-full-region";

  useEffect(() => {
    isComponentMounted.current = true;
    const html5QrCode = new Html5Qrcode(qrcodeRegionId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const hasCamera = await Html5Qrcode.getCameras();
        if (hasCamera && hasCamera.length > 0) {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            },
            (decodedText) => {
              if (isComponentMounted.current) {
                onScanSuccess(decodedText);
              }
            },
            () => {
              // スキャン中コールバック
            }
          );
        } else {
          setError("カメラが見つかりません。");
        }
      } catch (err) {
        console.error("Scanner Error:", err);
        if (isComponentMounted.current) {
          setError("カメラの起動に失敗しました。権限が許可されているか確認してください。");
        }
      }
    };

    startScanner();

    return () => {
      isComponentMounted.current = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  useEffect(() => {
    if (!scannerRef.current) return;
    
    if (isPaused && scannerRef.current.isScanning) {
      try {
        if (scannerRef.current.getState() === 2) { // 2 = SCANNING
           scannerRef.current.pause();
        }
      } catch (e) {
        console.error("Pause error", e);
      }
    } else if (!isPaused && scannerRef.current) {
      try {
         if (scannerRef.current.getState() === 3) { // 3 = PAUSED
           scannerRef.current.resume();
         }
      } catch (e) {
        console.error("Resume error", e);
      }
    }
  }, [isPaused]);

  return (
    <div className="scanner-container">
      {error && (
        <div style={{ padding: '1rem', color: 'var(--danger-color)', textAlign: 'center', backgroundColor: '#fee2e2' }}>
          {error}
        </div>
      )}
      <div id={qrcodeRegionId} style={{ width: '100%', minHeight: '250px' }} />
    </div>
  );
};
