import re
import math
from collections import Counter
import tldextract

def entropy(s):
    prob = [n/len(s) for n in Counter(s).values()]
    return -sum(p * math.log2(p) for p in prob)

keywords = ["login", "verify", "bank", "secure", "account"]

def extract_features(url):
    features = []

    # basic
    features.append(len(url))                      # url_length
    features.append(url.count('.'))                # num_dots
    features.append(url.count('-'))                # num_hyphens
    features.append(sum(c.isdigit() for c in url)) # num_digits
    features.append(1 if "https" in url else 0)    # has_https
    features.append(1 if re.search(r'\d+\.\d+\.\d+\.\d+', url) else 0) # has_ip

    # entropy
    features.append(entropy(url))

    # domain
    ext = tldextract.extract(url)
    features.append(len(ext.domain))               # domain_length
    features.append(len(ext.subdomain))            # subdomain_length
    features.append(ext.subdomain.count('.') + 1 if ext.subdomain else 0) # num_subdomains

    # keywords
    for kw in keywords:
        features.append(1 if kw in url.lower() else 0)

    return features