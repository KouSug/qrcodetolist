import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdQrCodeScanner, MdDelete, MdSend, MdArrowBack, MdContentCopy } from 'react-icons/md';

export function ListPage({ scans, onDelete, gasUrl, onClearScans }) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const formattedText = scans.map(s => `${new Date(s.timestamp).toLocaleString()}\t${s.text}`).join('\n');

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(formattedText)
        .then(() => setStatus({ type: 'success', message: 'コピーしました！スプレッドシートに貼り付けてください。' }))
        .catch(() => setStatus({ type: 'error', message: 'コピーに失敗しました。' }));
    } else {
      setStatus({ type: 'error', message: 'お使いのブラウザは自動コピーに対応していません。' });
    }
  };

  const handleSend = async () => {
    if (!gasUrl) {
      setStatus({ type: 'error', message: 'スキャナー画面の設定からGASのURLを入力してください。' });
      return;
    }

    if (scans.length === 0) {
      setStatus({ type: 'error', message: '送信するデータがありません。' });
      return;
    }

    try {
      setStatus({ type: 'success', message: '送信中...' });
      setIsSending(true);

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
      onClearScans();
    } catch (error) {
      console.error('Send error:', error);
      setStatus({ type: 'error', message: '送信に失敗しました。URLを確認してください。' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <button 
          className="btn-icon" 
          onClick={() => navigate('/')}
          style={{ position: 'absolute', left: '1rem' }}
          aria-label="戻る"
        >
          <MdArrowBack size={24} />
        </button>
        <h1>読み取りリスト</h1>
      </header>

      <main className="main-content">
        <section className="list-section" style={{ marginTop: '1rem' }}>
          <div className="list-header">
            <h2>読み取り件数</h2>
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
                    onClick={() => onDelete(scan.id)}
                    aria-label="削除"
                  >
                    <MdDelete size={20} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="action-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={handleCopy}
                disabled={scans.length === 0}
                style={{ flex: 1, backgroundColor: '#10b981', borderColor: '#10b981' }}
              >
                <MdContentCopy size={20} />
                コピー
              </button>

              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (window.confirm('すべての読み取り結果を削除しますか？')) {
                    onClearScans();
                  }
                }}
                disabled={scans.length === 0}
                style={{ flex: 1, backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              >
                <MdDelete size={20} />
                一括削除
              </button>

              {/* 将来GAS送信を復活させる場合のためのコード（非表示）
              <button 
                className="btn btn-primary" 
                onClick={handleSend}
                disabled={scans.length === 0 || isSending}
                style={{ flex: 1 }}
              >
                <MdSend size={20} />
                GAS送信
              </button>
              */}
            </div>
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
