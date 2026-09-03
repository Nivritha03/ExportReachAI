import os
import re
import urllib.parse
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed

def _get_serpapi_key():
    return os.environ.get("SERPAPI_KEY", "")

def _get_hunter_key():
    return os.environ.get("HUNTER_API_KEY", "")


# Domains that are NOT actual buyer companies (social media, marketplaces, directories)
JUNK_DOMAINS = {
    "facebook.com", "instagram.com", "twitter.com", "linkedin.com",
    "youtube.com", "pinterest.com", "tiktok.com",
    "amazon.com", "amazon.co.uk", "amazon.de", "amazon.ae",
    "ebay.com", "ebay.co.uk", "etsy.com", "aliexpress.com", "alibaba.com",
    "reddit.com", "quora.com", "yelp.com", "trustpilot.com",
    "google.com", "google.co.uk", "wikipedia.org", "wikihow.com",
    "blogspot.com", "wordpress.com", "wix.com", "squarespace.com",
    "tripadvisor.com", "indiamart.com", "globalsources.com", "made-in-china.com",
}


def _is_junk_domain(url: str) -> bool:
    """Returns True if URL belongs to a social media / marketplace site."""
    try:
        from urllib.parse import urlparse
        netloc = urlparse(url).netloc.replace("www.", "").lower()
        return any(netloc == d or netloc.endswith("." + d) for d in JUNK_DOMAINS)
    except Exception:
        return False


def search_serpapi_buyers(product_name: str, country: str, buyer_type: str, limit: int = 5) -> list:
    """
    Executes live Google search via SerpAPI to discover real companies.
    """
    key = _get_serpapi_key()
    if not key:
        return []

    query = f'"{product_name}" {buyer_type.lower()} {country}'
    params = {
        "engine": "google",
        "q": query,
        "api_key": key,
        "num": limit
    }

    discovered = []
    try:
        with httpx.Client(timeout=6.0) as client:
            resp = client.get("https://serpapi.com/search", params=params)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("organic_results", [])
                for r in results:
                    title = r.get("title", "")
                    link = r.get("link", "")
                    snippet = r.get("snippet", "")

                    if _is_junk_domain(link):
                        continue

                    company = title.split("-")[0].split("|")[0].split(":")[0].strip()
                    if len(company) < 2:
                        continue

                    discovered.append({
                        "name": "Purchasing Manager",
                        "company": company,
                        "email": "",
                        "website": link,
                        "country": country,
                        "business_type": buyer_type,
                        "source": "SerpAPI / Google",
                        "source_url": link,
                        "product": product_name,
                        "snippet": snippet
                    })
    except Exception as e:
        print(f"SerpAPI search error: {e}")

    return discovered


def enrich_and_verify_email_hunter(company_domain: str, company_name: str) -> tuple[str, str]:
    """
    Uses Hunter.io API Domain Search & Email Verifier to find business contact emails.
    """
    key = _get_hunter_key()
    if not key or not company_domain:
        return "", "unverified"

    clean_domain = urllib.parse.urlparse(company_domain).netloc or company_domain
    clean_domain = clean_domain.replace("www.", "").split("/")[0]

    try:
        with httpx.Client(timeout=4.0) as client:
            ds_url = f"https://api.hunter.io/v2/domain-search?domain={clean_domain}&api_key={key}"
            res = client.get(ds_url)
            if res.status_code == 200:
                data = res.json()
                emails = data.get("data", {}).get("emails", [])
                if emails:
                    top_email = emails[0].get("value")
                    ev_url = f"https://api.hunter.io/v2/email-verifier?email={top_email}&api_key={key}"
                    v_res = client.get(ev_url)
                    v_status = "verified"
                    if v_res.status_code == 200:
                        v_data = v_res.json().get("data", {})
                        v_result = v_data.get("status", "valid")
                        v_status = "verified" if v_result in ["valid", "accept_all"] else "needs_review"
                    
                    return top_email, v_status
    except Exception:
        pass

    return "", "unverified"


def _process_single_search_query(args):
    product_name, country, btype = args
    results = search_serpapi_buyers(product_name, country, btype, limit=3)
    hunter_key = _get_hunter_key()
    for b in results:
        if hunter_key and b.get("website"):
            email, v_status = enrich_and_verify_email_hunter(b["website"], b["company"])
            if email:
                b["email"] = email
                b["validation_status"] = v_status

        if not b.get("email"):
            raw_url = b.get("website", "")
            parsed = urllib.parse.urlparse(raw_url)
            domain = parsed.netloc.replace("www.", "").strip()
            if not domain:
                clean_comp = re.sub(r"[^a-zA-Z0-9]", "", b["company"].lower())[:15]
                tld_map = {"USA": "com", "UK": "co.uk", "Germany": "de", "UAE": "ae"}
                domain = f"{clean_comp or 'company'}.{tld_map.get(country, 'com')}"
            b["email"] = f"contact@{domain}"
            b["validation_status"] = "format_valid"
    return results


def discover_buyers(product_name: str, target_countries: list = None, buyer_types: list = None, max_results: int = 50) -> dict:
    """
    High-Speed Parallelized Buyer Discovery Engine using ThreadPoolExecutor.
    """
    if not target_countries:
        target_countries = ["USA", "UK", "Germany", "UAE"]
    if not buyer_types:
        buyer_types = ["Importer", "Distributor", "Wholesaler", "Retailer"]

    combos = []
    for c in target_countries[:3]:
        for t in buyer_types[:2]:
            combos.append((product_name, c, t))

    matched_buyers = []
    
    if _get_serpapi_key():
        with ThreadPoolExecutor(max_workers=6) as executor:
            future_to_combo = {executor.submit(_process_single_search_query, combo): combo for combo in combos}
            for future in as_completed(future_to_combo):
                try:
                    res = future.result()
                    matched_buyers.extend(res)
                    if len(matched_buyers) >= max_results:
                        break
                except Exception as e:
                    print(f"Parallel worker error: {e}")

    final_buyers = matched_buyers[:max_results]

    return {
        "product": product_name,
        "queries_generated": [f'"{product_name}" {t.lower()} {c}' for product_name, c, t in combos],
        "total_found": len(final_buyers),
        "buyers": final_buyers
    }

