import os
import sys
import joblib
import numpy as np
import tldextract
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure console supports utf-8 safely on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from feature import extract_features
from threat_intel import (
    get_domain_age,
    check_virustotal,
    check_urlhaus
)

app = FastAPI()

# Load XGBoost ML model safely
MODEL_PATH = os.path.join(os.path.dirname(__file__), "assets", "phishguard_xgb.pkl")
xgb_model = None
try:
    xgb_model = joblib.load(MODEL_PATH)
    try:
        print("✅ XGBoost Model preloaded successfully")
    except Exception:
        print("[+] XGBoost Model preloaded successfully")
except Exception as e:
    xgb_model = None
    print("Model load error:", e)


# ✅ CORS for Chrome Extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Known high-value targets frequently spoofed in subdomains
POPULAR_BRANDS = [
    "paypal", "apple", "google", "microsoft", "netflix", "amazon",
    "facebook", "instagram", "chase", "wellsfargo", "bankofamerica",
    "citibank", "binance", "coinbase", "whatsapp", "telegram",
    "twitter", "dropbox", "adobe", "yahoo", "ebay", "steam"
]

def check_brand_impersonation(domain_info):
    """
    Detects if a popular brand name is being impersonated in the subdomain
    while the registered domain belongs to someone else.
    """
    registered_domain = domain_info.domain.lower()
    subdomain = domain_info.subdomain.lower()

    if not subdomain:
        return None

    for brand in POPULAR_BRANDS:
        if (brand in subdomain or f"{brand}." in subdomain or f"{brand}-" in subdomain) and brand != registered_domain:
            return brand
    return None


# ✅ Home Route
@app.get("/")
def home():
    return {"message": "PhishGuard API running"}

# ✅ Prediction Route
@app.get("/predict")
def predict(url: str):

    try:
        ext = tldextract.extract(url)

        # ----------------------------
        # Feature Extraction
        # ----------------------------
        features = extract_features(url)

        # ----------------------------
        # Machine Learning Inference (XGBoost)
        # ----------------------------
        ml_prediction = 0
        ml_prob = 0.0
        if xgb_model is not None:
            try:
                feat_arr = np.array(features).reshape(1, -1)
                ml_prediction = int(xgb_model.predict(feat_arr)[0])
                if hasattr(xgb_model, "predict_proba"):
                    proba = xgb_model.predict_proba(feat_arr)[0]
                    ml_prob = float(proba[1]) if len(proba) > 1 else float(proba[0])
            except Exception as err:
                print("ML inference error:", err)

        # ----------------------------
        # Brand Impersonation Check
        # ----------------------------
        spoofed_brand = check_brand_impersonation(ext)

        # ----------------------------
        # Threat Intelligence
        # ----------------------------
        domain_age = get_domain_age(url)

        vt_score = check_virustotal(url)

        urlhaus_flag = check_urlhaus(url)

        # ----------------------------
        # Risk Scoring & Explainability
        # ----------------------------
        risk_score = 0
        reasons = []

        # Strong indicators (Known threat databases)
        if urlhaus_flag == 1:
            risk_score += 3
            reasons.append("Listed in URLHaus malicious database")

        if vt_score >= 2:
            risk_score += 3
            reasons.append(f"Flagged by {vt_score} security vendor(s) on VirusTotal")
        elif vt_score == 1:
            risk_score += 2
            reasons.append("Flagged by 1 security vendor on VirusTotal")

        # Brand Impersonation indicator (e.g. paypal.com in subdomain)
        if spoofed_brand:
            risk_score += 3
            reasons.append(f"Brand impersonation detected: '{spoofed_brand}' in subdomain of '{ext.domain}.{ext.suffix}'")

        # Machine Learning indicator
        if ml_prediction == 1:
            if ml_prob >= 0.80:
                risk_score += 3
                reasons.append(f"ML model identified high-confidence phishing pattern ({ml_prob * 100:.1f}%)")
            else:
                risk_score += 2
                reasons.append(f"ML model identified suspicious pattern ({ml_prob * 100:.1f}%)")

        # Domain age indicator
        if domain_age != -1:
            if domain_age < 7:
                risk_score += 2
                reasons.append(f"Domain is very new ({domain_age} days old)")
            elif domain_age < 30:
                risk_score += 1
                reasons.append(f"Domain is newly registered ({domain_age} days old)")

        if len(reasons) == 0:
            reasons.append("No threat indicators found")

        # ----------------------------
        # Final Verdict
        # ----------------------------
        if risk_score >= 3:
            verdict = "🚨 Phishing"
        elif risk_score >= 1:
            verdict = "⚠️ Suspicious"
        else:
            verdict = "✅ Safe"

        # ----------------------------
        # Response
        # ----------------------------
        return {
            "url": url,
            "ml_prediction": ml_prediction,
            "ml_confidence": round(ml_prob, 4),
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