import os
import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from feature import extract_features
from threat_intel import (
    get_domain_age,
    check_virustotal,
    check_urlhaus
)

app = FastAPI()

# Load XGBoost ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'assets', 'phishguard_xgb.pkl')
try:
    xgb_model = joblib.load(MODEL_PATH)
    print('✅ XGBoost Model preloaded successfully')
except Exception as e:
    xgb_model = None
    print('Model load error:', e)


# ✅ CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Home Route
@app.get("/")
def home():
    return {"message": "PhishGuard API running"}

# ✅ Prediction Route
@app.get("/predict")
def predict(url: str):

    try:

        # ----------------------------
        # Feature Extraction
        # ----------------------------
        features = extract_features(url)

        # ----------------------------
        # Machine Learning Inference (XGBoost)
        # ----------------------------
        ml_prediction = 0
        if xgb_model is not None:
            try:
                feat_arr = np.array(features).reshape(1, -1)
                ml_prediction = int(xgb_model.predict(feat_arr)[0])
            except Exception as err:
                print('ML inference error:', err)

        # ----------------------------
        # Threat Intelligence
        # ----------------------------
        domain_age = get_domain_age(url)

        vt_score = check_virustotal(url)

        urlhaus_flag = check_urlhaus(url)

        # ----------------------------
        # Risk Scoring
        # ----------------------------
        risk_score = 0

        # Strong indicators
        if urlhaus_flag == 1:
            risk_score += 3

        if vt_score > 0:
            risk_score += 2

        # Weak indicators
        if ml_prediction == 1:
            risk_score += 1

        if domain_age != -1 and domain_age < 10:
            risk_score += 1

        # ----------------------------
        # Reasons
        # ----------------------------
        reasons = []

        if ml_prediction == 1:
            reasons.append(
                "ML model flagged URL as suspicious"
            )

        if vt_score > 0:
            reasons.append(
                f"Flagged by {vt_score} engines on VirusTotal"
            )

        if urlhaus_flag == 1:
            reasons.append(
                "Found in URLHaus malicious database"
            )

        if domain_age != -1 and domain_age < 10:
            reasons.append(
                "Domain is very new (possible phishing)"
            )

        if len(reasons) == 0:
            reasons.append(
                "No major threat indicators found"
            )

        # ----------------------------
        # Final Verdict
        # ----------------------------
        if risk_score >= 3:
            verdict = "🚨 Phishing"

        elif risk_score == 2:
            verdict = "⚠️ Suspicious"

        else:
            verdict = "✅ Safe"

        # ----------------------------
        # Response
        # ----------------------------
        return {

            "url": url,

            "ml_prediction": ml_prediction,

            "domain_age_days": domain_age,

            "virustotal_score": vt_score,

            "urlhaus_flag": urlhaus_flag,

            "risk_score": risk_score,

            "verdict": verdict,

            "reasons": reasons
        }

    except Exception as e:

        return {
            "error": str(e)
        }