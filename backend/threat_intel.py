import whois
import tldextract
import requests
from datetime import datetime

def check_urlhaus(url):
    try:
        response = requests.post(
            "https://urlhaus-api.abuse.ch/v1/url/",
            data={"url": url}
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


def get_domain_age(url):
    try:
        if not url.startswith("http"):
            url = "http://" + url

        ext = tldextract.extract(url)
        domain = ext.domain + "." + ext.suffix

        w = whois.whois(domain)
        creation_date = w.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date is None:
            return -1

        if hasattr(creation_date, 'tzinfo') and creation_date.tzinfo is not None:
            creation_date = creation_date.replace(tzinfo=None)

        age = (datetime.now() - creation_date).days
        return age

    except Exception as e:
        print("WHOIS error:", e)
        return -1


def check_virustotal(url):
    try:
        headers = {"x-apikey": VT_API_KEY}

        response = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data={"url": url}
        )

        if response.status_code != 200:
            return 0

        analysis_id = response.json()["data"]["id"]

        report = requests.get(
            f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
            headers=headers
        )

        stats = report.json()["data"]["attributes"]["stats"]

        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)

        return malicious + suspicious

    except Exception as e:
        print("VT error:", e)
        return 0