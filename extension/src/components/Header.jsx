import React from 'react';

export default function Header({ isOnline, onRescan, isScanning }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '14px',
      paddingBottom: '10px',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '22px', filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))' }}>
          🛡️
        </span>
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px', color: '#f8fafc' }}>
            PhishGuard <span style={{ fontSize: '10px', fontWeight: 600, color: '#38bdf8', padding: '1px 5px', background: 'rgba(56, 189, 248, 0.12)', borderRadius: '4px' }}>AI</span>
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="status-pill" title={isOnline ? "FastAPI backend running" : "FastAPI backend offline"}>
          <div className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
          <span style={{ color: isOnline ? '#34d399' : '#fb7185' }}>
            {isOnline ? 'Active' : 'Offline'}
          </span>
        </div>

        <button
          onClick={onRescan}
          disabled={isScanning}
          title="Re-scan current tab"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
            borderRadius: '6px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isScanning ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            fontSize: '13px'
          }}
        >
          <span className={isScanning ? 'spinning' : ''}>🔄</span>
        </button>
      </div>
    </div>
  );
}
