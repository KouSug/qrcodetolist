import { useState, useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ScannerPage } from './pages/ScannerPage';
import { ListPage } from './pages/ListPage';

function App() {
  const [scans, setScans] = useState([]);
  const [gasUrl, setGasUrl] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('gasUrl');
    if (savedUrl) setGasUrl(savedUrl);
  }, []);

  const handleGasUrlChange = (url) => {
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
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
          gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
          
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
        }
      } catch (e) {
        console.error('Audio play failed', e);
      }

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

  const clearScans = () => setScans([]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ScannerPage 
            scans={scans} 
            onScanSuccess={handleScanSuccess}
            gasUrl={gasUrl}
            onGasUrlChange={handleGasUrlChange}
          />
        } 
      />
      <Route 
        path="/list" 
        element={
          <ListPage 
            scans={scans} 
            onDelete={handleDelete}
            gasUrl={gasUrl}
            onClearScans={clearScans}
          />
        } 
      />
    </Routes>
  );
}

export default App;
