import { useState, useCallback, useEffect } from 'react';
import { MdQrCodeScanner, MdDelete, MdSend, MdSettings, MdClose } from 'react-icons/md';
import { QrScanner } from './components/QrScanner';

function App() {
  const [scans, setScans] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gasUrl, setGasUrl] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const savedUrl = localStorage.getItem('gasUrl');
    if (savedUrl) setGasUrl(savedUrl);
  }, []);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleGasUrlChange = (e) => {
    const url = e.target.value;
    setGasUrl(url);
    localStorage.setItem('gasUrl', url);
  };

  const handleScanSuccess = useCallback((decodedText) => {
    setScans(prev => {
      const now = Date.now();
      const isDuplicate = prev.length > 0 && 
                          prev[0].text === decodedText && 
                          (now - prev[0].timestamp) < 2000;
      
      if (isDuplicate) return prev;

      try {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.play().catch(() => {});
      } catch (e) {}

      return [{
        id: crypto.randomUUID(),
        text: decodedText,
        timestamp: now
      }, ...prev];
    });
  }, []);

  const handleDelete = (id) => {
    setScans(prev => prev.filter(scan => scan.id !== id));
  };

  const handleSend = async () => {
    if (!gasUrl) {
      setStatus({ type: 'error', message: '設定からGASのURLを入力してください。' });
      setShowSettings(true);
      return;
    }

    if (scans.length === 0) {
      setStatus({ type: 'error', message: '送信するデータがありません。' });
      return;
    }

    try {
      setStatus({ type: 'success', message: '送信中...' });
      setIsPaused(true);

      const payload = scans.map(s => ({
        text: s.text,
        date: new Date(s.timestamp).toLocaleString()
      }));

      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      setStatus({ type: 'success', message: '送信完了しました！' });
      setScans([]);
    } catch (error) {
      console.error('Send error:', error);
      setStatus({ type: 'error', message: '送信に失敗しました。URLを確認してください。' });
    } finally {
      setIsPaused(false);
    }
  };

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

      <main className="main-content">
        {showSettings && (
          <div className="settings-panel">
            <div className="form-group">
              <label htmlFor="gasUrl">Google Apps Script Web App URL</label>
              <input
                id="gasUrl"
                type="url"
                className="form-input"
                placeholder="https://script.google.com/macros/s/..."
                value={gasUrl}
                onChange={handleGasUrlChange}
              />
              <small style={{ color: 'var(--text-secondary)' }}>
                送信先のスプレッドシート連携用URLを入力してください。
              </small>
            </div>
          </div>
        )}

        <section className="scanner-section">
          <div className="scanner-header">
            <h2>スキャナー</h2>
            <span className="badge">{isPaused ? '一時停止中' : 'スキャン中'}</span>
          </div>
          <QrScanner onScanSuccess={handleScanSuccess} isPaused={isPaused} />
        </section>

        <section className="list-section">
          <div className="list-header">
            <h2>読み取りリスト</h2>
            <span className="badge">{scans.length} 件</span>
          </div>

          {scans.length === 0 ? (
            <div className="empty-state">
              <MdQrCodeScanner size={48} style={{ opacity: 0.5 }} />
              <p>QRコードを読み取ると<br/>ここに追加されます</p>
            </div>
          ) : (
            <ul className="scan-list">
              {scans.map((scan) => (
                <li key={scan.id} className="scan-item">
                  <div className="scan-content">
                    <span className="scan-text">{scan.text}</span>
                    <span className="scan-time">
                      {new Date(scan.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(scan.id)}
                    aria-label="削除"
                  >
                    <MdDelete size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="action-section">
            <button 
              className="btn btn-primary" 
              onClick={handleSend}
              disabled={scans.length === 0}
            >
              <MdSend size={20} />
              スプレッドシートへ送信
            </button>
            {status && (
              <div className={`status-message status-${status.type}`}>
                {status.message}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
