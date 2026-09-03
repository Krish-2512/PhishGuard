import pandas as pd
import re
import math
from collections import Counter
import tldextract
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier


# -----------------------------
# Feature Functions
# -----------------------------

def entropy(s):
    prob = [n / len(s) for n in Counter(s).values()]
    return -sum(p * math.log2(p) for p in prob)


keywords = ["login", "verify", "bank", "secure", "account"]


def extract_features(url):
    feats = {}

    url = str(url)

    feats["url_length"] = len(url)
    feats["num_dots"] = url.count(".")
    feats["num_hyphens"] = url.count("-")
    feats["num_digits"] = sum(c.isdigit() for c in url)
    feats["has_https"] = int("https" in url.lower())
    feats["has_ip"] = int(bool(re.search(r"\d+\.\d+\.\d+\.\d+", url)))
    feats["has_at"] = int("@" in url)
    feats["num_slashes"] = url.count("/")
    feats["entropy"] = entropy(url)

    ext = tldextract.extract(url)

    feats["domain_length"] = len(ext.domain)
    feats["subdomain_length"] = len(ext.subdomain)
    feats["num_subdomains"] = ext.subdomain.count(".") + 1 if ext.subdomain else 0

    for kw in keywords:
        feats[f"has_{kw}"] = int(kw in url.lower())

    return feats


# -----------------------------
# Load Dataset
# -----------------------------

# CSV should contain columns: url,label
df = pd.read_csv("dataset.csv")

X = df["url"].apply(extract_features).apply(pd.Series)
y = df["label"]

# -----------------------------
# Train Test Split
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# Train Model
# -----------------------------

model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    eval_metric="logloss",
    use_label_encoder=False
)

model.fit(X_train, y_train)

# -----------------------------
# Evaluate
# -----------------------------

pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, pred))
print(classification_report(y_test, pred))

# -----------------------------
# Save Model
# -----------------------------

joblib.dump(model, "phishguard_model_v2.pkl")
print("Saved as phishguard_model_v2.pkl")