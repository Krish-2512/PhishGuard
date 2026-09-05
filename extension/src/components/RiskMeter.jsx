import React from 'react';

export default function RiskMeter({ score = 0, maxScore = 10 }) {
  // Normalize percentage for progress fill (clamp between 5% and 100%)
  const percentage = Math.min(Math.max((score / maxScore) * 100, 4), 100);

  let meterClass = 'safe';
  let severityLabel = 'Minimal Threat';

  if (score >= 4) {
    meterClass = 'danger';
    severityLabel = 'Critical Risk';
  } else if (score >= 1) {
    meterClass = 'suspicious';
    severityLabel = 'Elevated Risk';
  }

  return (
    <div className="risk-meter-container">
      <div className="risk-meter-header">
        <span>Risk Severity</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{severityLabel}</span>
          <span className="risk-score-value">{score} / {maxScore}</span>
        </div>
      </div>

      <div className="progress-track">
        <div
          className={`progress-fill ${meterClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
