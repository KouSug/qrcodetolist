import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export const QrScanner = ({ onScanSuccess, isPaused }) => {
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const isComponentMounted = useRef(true);
  const containerRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    if (!containerRef.current) return;
    
    // 強制的にコンテナの中身をクリアする（以前の不要なDOMが残っている場合への備え）
    containerRef.current.innerHTML = '';

    const scanRegion = document.createElement("div");
    const uniqueId = `qr-${Math.random().toString(36).substring(2, 10)}`;
    scanRegion.id = uniqueId;
    scanRegion.style.width = "100%";
    scanRegion.style.minHeight = "250px";
    containerRef.current.appendChild(scanRegion);

    const html5QrCode = new Html5Qrcode(uniqueId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const hasCamera = await Html5Qrcode.getCameras();
        if (!isActive) return;

        if (hasCamera && hasCamera.length > 0) {
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            },
            (decodedText) => {
              if (isActive) {
                onScanSuccess(decodedText);
              }
            },
            () => {
              // スキャン中コールバック
            }
          );

          if (!isActive) {
            if (html5QrCode.isScanning) {
              await html5QrCode.stop().catch(console.error);
            }
          }
        } else {
          setError("カメラが見つかりません。");
        }
      } catch (err) {
        console.error("Scanner Error:", err);
        if (isActive) {
          setError("カメラの起動に失敗しました。権限が許可されているか確認してください。");
        }
      }
    };

    startScanner();

    return () => {
      isActive = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      if (containerRef.current && scanRegion.parentNode === containerRef.current) {
        containerRef.current.removeChild(scanRegion);
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
      <div ref={containerRef} />
    </div>
  );
};
