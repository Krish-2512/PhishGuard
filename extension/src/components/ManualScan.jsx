import React, { useState } from 'react';
import VerdictBadge from './VerdictBadge.jsx';
import RiskMeter from './RiskMeter.jsx';
import ThreatDetails from './ThreatDetails.jsx';

export default function ManualScan({ apiBase = 'http://127.0.0.1:8000' }) {
  const [inputUrl, setInputUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e?.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const formattedUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
      const res = await fetch(`${apiBase}/predict?url=${encodeURIComponent(formattedUrl)}`);
      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not connect to scanner API');
    } finally {
      setIsScanning(false);
    }
  };

  const sampleLinks = [
    { label: 'PayPal Phish Example', url: 'http://paypal.com.account-update.verify-service.net/login' },
    { label: 'Google (Legit)', url: 'https://www.google.com' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <form onSubmit={handleScan} className="scanner-form">
        <input
          type="text"
          placeholder="Paste URL to inspect (e.g. http://login.bank-verify.cc)..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="scanner-input"
        />
        <button
          type="submit"
          disabled={isScanning || !inputUrl.trim()}
          className="scanner-btn"
        >
          {isScanning ? 'Analyzing Target URL...' : 'Inspect Link 🔍'}
        </button>
      </form>

      {/* Quick Test Links */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '10px', color: '#64748b' }}>Quick test:</span>
        {sampleLinks.map((s, i) => (
          <button
            key={i}
            onClick={() => { setInputUrl(s.url); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              fontSize: '10px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '10px',
          borderRadius: '8px',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#fb7185',
          fontSize: '11px',
          textAlign: 'center'
        }}>
          ⚠️ {error}
        </div>
      )}

      {isScanning && (
        <VerdictBadge verdict={null} isScanning={true} />
      )}

      {result && !isScanning && (
        <div style={{ marginTop: '6px' }}>
          <VerdictBadge verdict={result.verdict} isScanning={false} />
          <RiskMeter score={result.risk_score} maxScore={10} />
          <ThreatDetails data={result} />
        </div>
      )}
    </div>
  );
}
