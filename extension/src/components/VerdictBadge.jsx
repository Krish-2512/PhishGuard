import React from 'react';

export default function VerdictBadge({ verdict, isScanning }) {
  if (isScanning) {
    return (
      <div className="verdict-card" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)' }}>
        <div className="verdict-icon-container">
          <span className="spinning" style={{ display: 'inline-block' }}>🔍</span>
        </div>
        <div className="verdict-title" style={{ color: '#94a3b8' }}>Analyzing Target...</div>
        <div className="verdict-subtitle">Querying ML models & Threat Intelligence</div>
      </div>
    );
  }

  let type = 'safe';
  let icon = '✅';
  let title = 'Safe';
  let subtitle = 'No malicious indicators or spoofing detected.';

  if (verdict?.includes('Phishing') || verdict?.includes('Danger') || verdict?.includes('🚨')) {
    type = 'phishing';
    icon = '🚨';
    title = 'Phishing Detected';
    subtitle = 'High risk: Deceptive patterns or brand spoofing found!';
  } else if (verdict?.includes('Suspicious') || verdict?.includes('⚠️')) {
    type = 'suspicious';
    icon = '⚠️';
    title = 'Suspicious Domain';
    subtitle = 'Caution advised: Domain shows abnormal characteristics.';
  }

  return (
    <div className={`verdict-card ${type}`}>
      <div className="verdict-icon-container">{icon}</div>
      <div className="verdict-title">{title}</div>
      <div className="verdict-subtitle">{subtitle}</div>
    </div>
  );
}
