# 🛡️ PhishGuard

PhishGuard is a real-time phishing detection system that combines:

- Machine Learning
- Threat Intelligence APIs
- Domain Intelligence
- Browser Extension Monitoring

to detect malicious and suspicious URLs directly inside the browser.

---

# 🚀 Features

✅ Real-time URL scanning  
✅ Chrome Extension integration  
✅ FastAPI backend  
✅ VirusTotal threat intelligence  
✅ URLHaus malicious URL detection  
✅ WHOIS domain age analysis  
✅ Explainable risk scoring system  
✅ Lightweight and fast architecture  

---

# 🧠 Detection Pipeline

PhishGuard analyzes URLs using multiple layers:

## 1. Feature Extraction
Extracts phishing indicators such as:

- URL length
- Special characters
- Subdomains
- Redirections
- Suspicious keywords
- Entropy
- IP-based URLs

---

## 2. Machine Learning Detection

Uses an XGBoost phishing classifier trained on phishing datasets.

---

## 3. Threat Intelligence

Integrates:

- VirusTotal API
- URLHaus database
- WHOIS domain analysis

---

## 4. Risk Scoring Engine

Combines:
- ML predictions
- Threat intelligence results
- Domain age
- Known malicious databases

to generate:

- ✅ Safe
- ⚠️ Suspicious
- 🚨 Phishing

---

# 🏗️ Project Structure

```bash
phishguard/
│
├── backend/
│   ├── main.py
│   ├── feature.py
│   ├── threat_intel.py
│   └── requirements.txt
│
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── style.css
│
├── training/
│   └── train_model.py
│
├── README.md
└── .gitignore
```

---

# ⚙️ Backend Setup

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/phishguard.git
cd phishguard
```

---

## 2. Create Virtual Environment

```bash
python3 -m venv venv
```

Activate:

### macOS/Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Run Backend

```bash
uvicorn main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

---

# 🌐 Chrome Extension Setup

## 1. Open Chrome Extensions

Go to:

```text
chrome://extensions
```

---

## 2. Enable Developer Mode

Toggle ON:
- Developer Mode

---

## 3. Load Extension

Click:

```text
Load unpacked
```

Select:

```text
extension/
```

folder.

---

# 🔍 API Endpoint

## Predict URL

```http
GET /predict?url=https://example.com
```

Example:

```text
http://127.0.0.1:8000/predict?url=https://google.com
```

---

# 📦 Sample Response

```json
{
  "url": "https://example.com",
  "ml_prediction": 0,
  "domain_age_days": 3000,
  "virustotal_score": 0,
  "urlhaus_flag": 0,
  "risk_score": 0,
  "verdict": "✅ Safe",
  "reasons": [
    "No major threat indicators found"
  ]
}
```

---

# 🛠️ Tech Stack

## Backend
- Python
- FastAPI
- XGBoost
- Requests
- WHOIS
- tldextract

## Frontend
- JavaScript
- Chrome Extension APIs
- HTML/CSS

## Threat Intelligence
- VirusTotal API
- URLHaus API

---

# 🔐 Security Features

- Detects newly registered domains
- Checks against known malware databases
- Uses ML-based phishing classification
- Provides explainable verdict reasoning

---

# 📈 Future Improvements

- Live webpage scanning
- OCR phishing detection
- Email phishing analysis
- Screenshot-based detection
- AI explanation engine
- Cloud deployment
- Real-time blacklist syncing

---

# 👨‍💻 Author
- Ekas Babbar, 2nd Year, IIT Guwahati
- Naisha Rajput, 2nd Year, IIT Roorkee

---

