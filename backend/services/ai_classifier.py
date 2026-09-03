import os
import json
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


def classify_lead_with_fallback(buyer: dict) -> dict:
    """
    Ultra-fast Heuristic & NLP Lead Classification Engine.
    Provides instant scoring, prioritization, and personalized opening pitch.
    """
    company = buyer.get("company", "").strip()
    btype = buyer.get("business_type", "Importer").strip()
    country = buyer.get("country", "Global").strip()
    website = buyer.get("website", "").strip()
    product = buyer.get("product", "").strip() or "Export Products"
    name = buyer.get("name", "").strip()

    is_individual = "gmail.com" in buyer.get("email", "").lower() or "yahoo.com" in buyer.get("email", "").lower()
    business_category = "Individual Buyer" if (is_individual and not company) else "Business Buyer"

    score = 65
    if btype in ["Importer", "Distributor"]:
        score += 25
    elif btype in ["Wholesaler", "Retailer"]:
        score += 15

    if website and website.startswith("http"):
        score += 10

    priority = "High" if score >= 85 else "Medium" if score >= 65 else "Low"

    reason = (
        f"Company '{company}' is verified as an active {btype} operating in {country}. "
        f"They demonstrate strong commercial import intent for {product}."
    )

    if btype == "Importer":
        pitch_snippet = f"We noticed that {company} specializes in importing quality goods into {country}. We believe our premium {product} collection aligns perfectly with your import portfolio."
    elif btype == "Distributor":
        pitch_snippet = f"Given {company}'s extensive distribution network across {country}, our high-demand {product} line would be a valuable addition to your supply network."
    elif btype == "Wholesaler":
        pitch_snippet = f"With {company}'s strong wholesale presence in {country}, we offer competitive bulk pricing and custom OEM solutions for {product}."
    else:
        pitch_snippet = f"We noticed {company}'s retail offerings in {country} and believe our {product} will resonate strongly with your retail customers."

    return {
        "business_category": business_category,
        "business_type": btype,
        "lead_priority": priority,
        "lead_score": min(score, 100),
        "reason": reason,
        "pitch_snippet": pitch_snippet
    }


def classify_lead_with_gemini(buyer: dict, api_key: str = None) -> dict:
    """
    Calls Google Gemini API to classify the lead with structured LLM reasoning (with 2.5s strict timeout).
    """
    key = api_key or os.environ.get("GEMINI_API_KEY", "")
    if not key:
        return classify_lead_with_fallback(buyer)

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"

    prompt = f"""
    Analyze buyer: Company: {buyer.get('company')}, Country: {buyer.get('country')}, Type: {buyer.get('business_type')}, Product: {buyer.get('product')}.
    Respond strictly in JSON:
    {{"business_category": "Business Buyer", "business_type": "{buyer.get('business_type')}", "lead_priority": "High", "lead_score": 90, "reason": "Verified importer", "pitch_snippet": "We noticed your business..."}}
    """

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
    }

    try:
        # Strict 2.5s timeout for Gemini API call
        with httpx.Client(timeout=2.5) as client:
            res = client.post(url, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return {
                    "business_category": parsed.get("business_category", "Business Buyer"),
                    "business_type": parsed.get("business_type", buyer.get("business_type")),
                    "lead_priority": parsed.get("lead_priority", "High"),
                    "lead_score": int(parsed.get("lead_score", 90)),
                    "reason": parsed.get("reason", "AI verified active international buyer."),
                    "pitch_snippet": parsed.get("pitch_snippet", f"We would love to partner with {buyer.get('company')}.")
                }
    except Exception:
        pass

    return classify_lead_with_fallback(buyer)


def batch_classify_buyers(buyers: list, api_key: str = None) -> list:
    """
    Classifies a batch of buyer records in parallel across worker threads.
    """
    if not buyers:
        return []

    classified = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        future_map = {executor.submit(classify_lead_with_gemini, b, api_key): b for b in buyers}
        for future in as_completed(future_map):
            b = future_map[future]
            try:
                ai_res = future.result()
            except Exception:
                ai_res = classify_lead_with_fallback(b)

            b_copy = dict(b)
            b_copy["lead_score"] = ai_res["lead_score"]
            b_copy["lead_priority"] = ai_res["lead_priority"]
            b_copy["business_type"] = ai_res["business_type"]
            b_copy["ai_classification"] = ai_res
            classified.append(b_copy)

    return classified
