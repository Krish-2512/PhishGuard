import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import VerdictBadge from './components/VerdictBadge.jsx';
import RiskMeter from './components/RiskMeter.jsx';
import ThreatDetails from './components/ThreatDetails.jsx';
import ManualScan from './components/ManualScan.jsx';

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'manual' | 'raw'
  const [currentUrl, setCurrentUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check backend server connection
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        setIsOnline(true);
        return true;
      }
      setIsOnline(false);
      return false;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  // Fetch scan for the active URL
  const scanUrl = useCallback(async (urlToScan) => {
    if (!urlToScan || urlToScan.startsWith('chrome://') || urlToScan.startsWith('edge://')) {
      setCurrentUrl(urlToScan || 'System Page');
      setScanResult({
        url: urlToScan,
        verdict: '✅ Safe',
        risk_score: 0,
        reasons: ['Browser internal system page']
      });
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/predict?url=${encodeURIComponent(urlToScan)}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setScanResult(data);
      setIsOnline(true);
    } catch (err) {
      console.error('PhishGuard Scan Error:', err);
      setError(err.message || 'Cannot communicate with backend');
      setIsOnline(false);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Retrieve current active tab
  const getActiveTabUrl = useCallback(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].url) {
          const url = tabs[0].url;
          setCurrentUrl(url);
          scanUrl(url);
        } else {
          setCurrentUrl('No active page');
        }
      });
    } else {
      // Fallback for local Vite dev testing
      const devUrl = 'http://paypal.com.account-update.verify-service.net/login';
      setCurrentUrl(devUrl);
      scanUrl(devUrl);
    }
  }, [scanUrl]);

  useEffect(() => {
    checkHealth();
    getActiveTabUrl();
  }, [checkHealth, getActiveTabUrl]);

  const handleCopyUrl = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getDomainName = (url) => {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url || 'Unknown';
    }
  };

  return (
    <div className="app-container">
      {/* Extension Header */}
      <Header
        isOnline={isOnline}
        isScanning={isScanning}
        onRescan={() => {
          checkHealth();
          getActiveTabUrl();
        }}
      />

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <span>🌐</span> Live Scan
        </button>
        <button
          className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          <span>🔍</span> Manual Test
        </button>
        <button
          className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw')}
        >
          <span>📊</span> Raw Data
        </button>
      </div>

      {/* TAB 1: LIVE SCAN */}
      {activeTab === 'live' && (
        <>
          {/* Active URL Card */}
          <div className="url-bar-card">
            <div className="url-info">
              <div className="url-domain">{getDomainName(currentUrl)}</div>
              <div className="url-full" title={currentUrl}>{currentUrl}</div>
            </div>
            <button
              onClick={handleCopyUrl}
              className="copy-btn"
              title="Copy URL"
            >
              <span>{copied ? '✓' : '📋'}</span>
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Backend Error / Offline Warning */}
          {!isOnline && error && (
            <div style={{
              padding: '12px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f8fafc',
              fontSize: '11px',
              lineHeight: '1.5',
              marginBottom: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: 700, color: '#fb7185', marginBottom: '4px' }}>
                ⚠️ Backend Offline
              </div>
              <div>Ensure the FastAPI server is running at <code>http://127.0.0.1:8000</code></div>
              <div style={{ marginTop: '4px', fontSize: '10px', color: '#94a3b8' }}>
                Run: <code>uvicorn main:app --reload</code> in <code>backend/</code>
              </div>
            </div>
          )}

          {/* Verdict Badge */}
          <VerdictBadge
            verdict={scanResult?.verdict}
            isScanning={isScanning}
          />

          {/* Risk Meter & Findings */}
          {scanResult && !isScanning && (
            <>
              <RiskMeter score={scanResult.risk_score || 0} maxScore={10} />
              <ThreatDetails data={scanResult} />
            </>
          )}
        </>
      )}

      {/* TAB 2: MANUAL SCANNER */}
      {activeTab === 'manual' && (
        <ManualScan apiBase={BACKEND_URL} />
      )}

      {/* TAB 3: RAW DATA / INSPECTOR */}
      {activeTab === 'raw' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '12px',
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#38bdf8',
          maxHeight: '340px',
          overflowY: 'auto'
        }}>
          {scanResult ? (
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>
              No telemetry captured yet.
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '12px',
        textAlign: 'center',
        fontSize: '10px',
        color: 'var(--text-dim)',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        PhishGuard AI • XGBoost + Threat Intel Protection
      </div>
    </div>
  );
}
