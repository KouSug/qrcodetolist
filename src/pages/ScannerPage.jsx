import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdQrCodeScanner, MdSettings, MdClose, MdList } from 'react-icons/md';
import { QrScanner } from '../components/QrScanner';

export function ScannerPage({ scans, onScanSuccess, gasUrl, onGasUrlChange, scannerTitle, onScannerTitleChange }) {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <header className="header">
        <h1><MdQrCodeScanner /> QR Code Scanner</h1>
        <button 
          className="btn-icon" 
          onClick={() => setShowSettings(!showSettings)}
          style={{ position: 'absolute', right: '1rem' }}
          aria-label="設定"
        >
          {showSettings ? <MdClose size={24} /> : <MdSettings size={24} />}
        </button>
      </header>

      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {showSettings && (
          <div className="settings-panel">
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="scannerTitle">スキャナー画面の見出し</label>
              <input
                id="scannerTitle"
                type="text"
                className="form-input"
                placeholder="例: QRコード読み取り"
                value={scannerTitle}
                onChange={(e) => onScannerTitleChange(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gasUrl">Google Apps Script Web App URL</label>
              <input
                id="gasUrl"
                type="url"
                className="form-input"
                placeholder="https://script.google.com/macros/s/..."
                value={gasUrl}
                onChange={(e) => onGasUrlChange(e.target.value)}
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                送信先のスプレッドシート連携用URLを入力してください。
              </small>
            </div>
          </div>
        )}

        <section className="scanner-section" style={{ flexGrow: 1 }}>
          <div className="scanner-header">
            <h2>{scannerTitle}</h2>
            <span className="badge">スキャン中</span>
          </div>
          <QrScanner onScanSuccess={onScanSuccess} isPaused={false} />
        </section>

        <div className="action-section" style={{ marginTop: 'auto' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/list')}
          >
            <MdList size={24} />
            リストを見る ({scans.length} 件)
          </button>
        </div>
      </main>
    </div>
  );
}
