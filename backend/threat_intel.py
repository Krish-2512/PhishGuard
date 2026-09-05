import base64
from datetime import datetime
import requests
import tldextract
import whois

def check_urlhaus(url):
    try:
        response = requests.post(
            "https://urlhaus-api.abuse.ch/v1/url/",
            data={"url": url},
            timeout=5
        )

        data = response.json()

        if data.get("query_status") == "ok":
            return 1   # found → malicious
        else:
            return 0   # not found

    except Exception as e:
        print("URLHaus error:", e)
        return 0

VT_API_KEY = "0173b4f1acb218516a1995292cc45a2ec7d7b465a4bd187648b4a6530aaa156b"


from concurrent.futures import ThreadPoolExecutor

def _lookup_whois(domain):
    try:
        return whois.whois(domain)
    except Exception:
        return None

def get_domain_age(url):
    try:
        if not url.startswith("http"):
            url = "http://" + url

        ext = tldextract.extract(url)
        domain = ext.domain + "." + ext.suffix

        w = None
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_lookup_whois, domain)
            try:
                w = future.result(timeout=4)
            except Exception:
                return -1

        if not w:
            return -1

        creation_date = w.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date is None:
            return -1

        if hasattr(creation_date, 'tzinfo') and creation_date.tzinfo is not None:
            creation_date = creation_date.replace(tzinfo=None)

        age = (datetime.now() - creation_date).days
        return age

    except Exception:
        return -1



def check_virustotal(url):
    try:
        headers = {"x-apikey": VT_API_KEY}
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

        # Check existing analysis report first (fast and synchronous)
        response = requests.get(
            f"https://www.virustotal.com/api/v3/urls/{url_id}",
            headers=headers,
            timeout=5
        )

        if response.status_code == 200:
            stats = response.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            return malicious + suspicious

        return 0

    except Exception as e:
        print("VT error:", e)
        return 0