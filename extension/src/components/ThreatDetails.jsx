import React from 'react';

export default function ThreatDetails({ data }) {
  if (!data) return null;

  const {
    reasons = [],
    ml_prediction = 0,
    ml_confidence = 0,
    domain_age_days = -1,
    virustotal_score = 0,
    urlhaus_flag = 0
  } = data;

  const formattedMlConfidence = ml_confidence
    ? `${(ml_confidence * 100).toFixed(1)}%`
    : ml_prediction === 1 ? 'High' : 'Low (<1%)';

  const formattedDomainAge = domain_age_days === -1
    ? 'Unknown / No record'
    : `${domain_age_days} days`;

  return (
    <div>
      {/* Explainable Reasons */}
      <div className="threats-container">
        <div className="threats-title">
          <span>🛡️</span> Security Analysis Findings
        </div>

        {reasons.length === 0 ? (
          <div className="reason-chip safe">
            <span>•</span>
            <span>No security threats or deceptive flags identified.</span>
          </div>
        ) : (
          reasons.map((reason, idx) => {
            let chipClass = 'safe';
            if (reason.toLowerCase().includes('phishing') || reason.toLowerCase().includes('impersonation') || reason.toLowerCase().includes('malicious')) {
              chipClass = 'danger';
            } else if (reason.toLowerCase().includes('suspicious') || reason.toLowerCase().includes('newly registered') || reason.toLowerCase().includes('vendor')) {
              chipClass = 'warning';
            }

            return (
              <div key={idx} className={`reason-chip ${chipClass}`}>
                <span>•</span>
                <span>{reason}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Threat Intel Grid */}
      <div className="intel-grid">
        <div className="intel-card">
          <div className="intel-label">AI / ML Model</div>
          <div className="intel-val" style={{ color: ml_prediction === 1 ? '#fb7185' : '#34d399' }}>
            {ml_prediction === 1 ? `Deceptive (${formattedMlConfidence})` : `Legit (${formattedMlConfidence})`}
          </div>
        </div>

        <div className="intel-card">
          <div className="intel-label">Domain Age</div>
          <div className="intel-val">
            {formattedDomainAge}
          </div>
        </div>

        <div className="intel-card">
          <div className="intel-label">VirusTotal Detections</div>
          <div className="intel-val" style={{ color: virustotal_score > 0 ? '#fb7185' : '#f8fafc' }}>
            {virustotal_score} vendor(s)
          </div>
        </div>

        <div className="intel-card">
          <div className="intel-label">URLHaus Database</div>
          <div className="intel-val" style={{ color: urlhaus_flag === 1 ? '#fb7185' : '#34d399' }}>
            {urlhaus_flag === 1 ? 'Blacklisted' : 'Clean'}
          </div>
        </div>
      </div>
    </div>
  );
}
