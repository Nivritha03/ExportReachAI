import os
import sys
import io
import csv
import urllib.parse
from datetime import datetime


from dotenv import load_dotenv

# Ensure backend directory is in python path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Load environment variables from .env
load_dotenv(os.path.join(BASE_DIR, ".env"))


from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from sqlalchemy.orm import Session

from database import init_db, get_db, Buyer, Campaign, EmailLog, ContactHistory
from services.buyer_discovery import discover_buyers
from services.data_validator import clean_and_validate_buyers
from services.ai_classifier import batch_classify_buyers, classify_lead_with_gemini
from services.email_sender import execute_campaign_batch

# Initialize SQLite database
init_db()

app = FastAPI(
    title="ExportReach AI - Export Marketing Automation System",
    description="Find international buyers, validate contacts, classify leads with AI, and automate Gmail outreach.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# In-memory Gmail & Gemini settings store
SYSTEM_SETTINGS = {
    "gmail_username": "",
    "gmail_password": "",
    "gmail_mode": "simulation",       # simulation | live | oauth
    "gemini_api_key": os.environ.get("GEMINI_API_KEY", ""),
    "gmail_access_token": "",         # set after OAuth callback
    "gmail_refresh_token": "",
}


# --- API ENDPOINTS ---

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "ExportReach AI",
        "timestamp": datetime.utcnow().isoformat(),
        "gmail_connected": bool(SYSTEM_SETTINGS["gmail_username"]) or SYSTEM_SETTINGS["gmail_mode"] == "simulation",
        "gmail_mode": SYSTEM_SETTINGS["gmail_mode"]
    }


@app.post("/api/buyers/search")
def search_buyers_endpoint(payload: dict, db: Session = Depends(get_db)):
    """
    Step 1: Multi-source Buyer Discovery.
    Accepts: { product_name, target_countries, buyer_types, max_results }
    """
    product_name = payload.get("product_name", "Singing Bowls").strip()
    target_countries = payload.get("target_countries", ["USA", "UK", "Germany", "UAE"])
    buyer_types = payload.get("buyer_types", ["Importer", "Distributor", "Wholesaler", "Retailer"])
    max_results = int(payload.get("max_results", 50))

    if not product_name:
        raise HTTPException(status_code=400, detail="Product name is required")

    result = discover_buyers(
        product_name=product_name,
        target_countries=target_countries,
        buyer_types=buyer_types,
        max_results=max_results
    )

    return result


@app.post("/api/buyers/discover")
def full_discover_pipeline_endpoint(payload: dict, db: Session = Depends(get_db)):
    """
    Unified API-driven discovery pipeline endpoint.
    Accepts: { product: str, countries: list, buyer_types: list, limit: int }
    Runs Discovery -> Validation & Cleaning -> AI Qualification -> DB Save
    """
    product = payload.get("product") or payload.get("product_name", "Singing Bowls")
    countries = payload.get("countries") or payload.get("target_countries", ["USA", "UK", "Germany", "UAE"])
    buyer_types = payload.get("buyer_types", ["Importer", "Distributor", "Wholesaler", "Retailer"])
    limit = int(payload.get("limit") or payload.get("max_results", 50))

    # 1. Search / Discovery
    disc_res = discover_buyers(
        product_name=product,
        target_countries=countries,
        buyer_types=buyer_types,
        max_results=limit
    )
    discovered_raw = disc_res.get("buyers", [])

    # 2. Data Cleaning & Email Validation
    val_res = clean_and_validate_buyers(db, discovered_raw)
    valid_buyers = val_res.get("valid_records", [])

    # 3. AI Classification & Scoring
    api_key = SYSTEM_SETTINGS.get("gemini_api_key")
    classified_buyers = batch_classify_buyers(valid_buyers, api_key=api_key)

    # 4. Save to Database & Track Duplicates
    new_inserted_count = 0
    duplicate_count = 0
    saved_buyers = []

    for b in classified_buyers:
        norm_email = (b.get("normalized_email") or b.get("email", "")).strip().lower()

        # Skip buyers with no email at all
        if not norm_email or "@" not in norm_email:
            continue

        # Skip exact duplicates already in DB
        existing = db.query(Buyer).filter(Buyer.normalized_email == norm_email).first()
        if existing:
            duplicate_count += 1
            saved_buyers.append(existing.to_dict())
            continue

        import json as _json
        ai_data = b.get("ai_classification")
        ai_str = _json.dumps(ai_data) if isinstance(ai_data, dict) else str(ai_data or "{}")

        # Determine credible verification status
        raw_status = b.get("validation_status") or b.get("email_status", "")
        if raw_status in ("verified", "valid"):
            v_status = "verified"
            email_ok = True
        elif raw_status in ("format_valid", "manual_review"):
            v_status = "format_valid"  # real domain, unverified inbox
            email_ok = True
        elif raw_status in ("hunter_verified",):
            v_status = "hunter_verified"
            email_ok = True
        else:
            # Derive from email structure
            parts = norm_email.split("@")
            if len(parts) == 2 and "." in parts[1]:
                v_status = "format_valid"
                email_ok = True
            else:
                v_status = "unknown"
                email_ok = False

        db_buyer = Buyer(
            name=b.get("name", "Purchase Manager"),
            company=b.get("company", "Business Importer"),
            email=b.get("email", norm_email),
            normalized_email=norm_email,
            website=b.get("website", ""),
            country=b.get("country", "Global"),
            business_type=b.get("business_type", "Importer"),
            source=b.get("source", "SerpAPI / Google"),
            source_url=b.get("source_url", ""),
            product=product,
            lead_score=int(b.get("lead_score", 85)),
            lead_priority=b.get("lead_priority", "High"),
            ai_classification=ai_str,
            email_valid=email_ok,
            validation_status=v_status,
            is_contacted=False
        )
        db.add(db_buyer)
        db.commit()
        db.refresh(db_buyer)
        new_inserted_count += 1
        saved_buyers.append(db_buyer.to_dict())

    # If all items were duplicates in this search run, return the matching database buyers so table always renders
    if not saved_buyers:
        matching_db = db.query(Buyer).filter(Buyer.product == product).order_by(Buyer.id.desc()).limit(limit).all()
        saved_buyers = [b.to_dict() for b in matching_db]

    return {
        "status": "success",
        "total_found": len(discovered_raw) if len(discovered_raw) > 0 else len(saved_buyers),
        "new_inserted": new_inserted_count,
        "duplicates": duplicate_count,
        "verified": sum(1 for b in saved_buyers if b.get("validation_status") == "verified"),
        "high_priority": sum(1 for b in saved_buyers if b.get("lead_priority") == "High"),
        "buyers": saved_buyers
    }




@app.post("/api/buyers/validate")
def validate_buyers_endpoint(payload: dict, db: Session = Depends(get_db)):
    """
    Step 3: Data Cleaning, Email Validation, and Deduplication.
    Accepts: { buyers: [...] }
    """
    raw_buyers = payload.get("buyers", [])
    if not raw_buyers:
        raise HTTPException(status_code=400, detail="No buyer records provided for validation")

    validation_result = clean_and_validate_buyers(db, raw_buyers)
    return validation_result


@app.post("/api/buyers/classify")
def classify_buyers_endpoint(payload: dict):
    """
    Step 4: AI Lead Classification & Qualification.
    Accepts: { buyers: [...] }
    """
    raw_buyers = payload.get("buyers", [])
    if not raw_buyers:
        raise HTTPException(status_code=400, detail="No buyer records provided for AI classification")

    api_key = SYSTEM_SETTINGS.get("gemini_api_key")
    classified = batch_classify_buyers(raw_buyers, api_key=api_key)

    return {
        "total_classified": len(classified),
        "buyers": classified
    }


@app.post("/api/buyers/save")
def save_buyers_endpoint(payload: dict, db: Session = Depends(get_db)):
    """
    Saves classified valid buyers into the database.
    """
    buyers_data = payload.get("buyers", [])
    saved_count = 0

    for b in buyers_data:
        norm_email = (b.get("normalized_email") or b.get("email", "")).lower()
        existing = db.query(Buyer).filter(Buyer.normalized_email == norm_email).first()
        if existing:
            continue

        ai_data = b.get("ai_classification")
        if isinstance(ai_data, dict):
            import json
            ai_str = json.dumps(ai_data)
        else:
            ai_str = str(ai_data or "{}")

        db_buyer = Buyer(
            name=b.get("name", "Purchase Manager"),
            company=b.get("company", "Business Buyer"),
            email=b.get("email", ""),
            normalized_email=norm_email,
            website=b.get("website", ""),
            country=b.get("country", "Global"),
            business_type=b.get("business_type", "Importer"),
            source=b.get("source", "Google"),
            source_url=b.get("source_url", ""),
            product=b.get("product", ""),
            lead_score=int(b.get("lead_score", 70)),
            lead_priority=b.get("lead_priority", "Medium"),
            ai_classification=ai_str,
            email_valid=b.get("email_valid", True),
            validation_status=b.get("validation_status", "valid"),
            is_contacted=b.get("is_contacted", False)
        )
        db.add(db_buyer)
        saved_count += 1

    db.commit()
    return {"status": "success", "saved_count": saved_count}


@app.get("/api/buyers")
def get_buyers_endpoint(
    status: str = Query(None),
    priority: str = Query(None),
    business_type: str = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Buyer)
    if status:
        query = query.filter(Buyer.validation_status == status)
    if priority:
        query = query.filter(Buyer.lead_priority == priority)
    if business_type:
        query = query.filter(Buyer.business_type == business_type)
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            (Buyer.company.like(s_term)) | (Buyer.name.like(s_term)) | (Buyer.email.like(s_term)) | (Buyer.country.like(s_term))
        )

    buyers = query.order_by(Buyer.id.desc()).all()
    return [b.to_dict() for b in buyers]


@app.get("/api/buyers/{buyer_id}")
def get_buyer_detail(buyer_id: int, db: Session = Depends(get_db)):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return buyer.to_dict()


@app.delete("/api/buyers/{buyer_id}")
def delete_buyer(buyer_id: int, db: Session = Depends(get_db)):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    db.delete(buyer)
    db.commit()
    return {"status": "deleted", "id": buyer_id}


# --- CAMPAIGN & OUTREACH ENDPOINTS ---

@app.post("/api/upload-presentation")
async def upload_presentation(file: UploadFile = File(...)):
    """
    Step 5 & 8: Upload Company Presentation PDF file.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF presentation files are allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {
        "status": "uploaded",
        "filename": file.filename,
        "path": file_path
    }


@app.post("/api/campaigns")
def create_campaign_endpoint(payload: dict, db: Session = Depends(get_db)):
    """
    Step 5: Configure Export Outreach Campaign.
    """
    default_pdf = os.path.join(BASE_DIR, "..", "assets", "sample_presentation.pdf")
    if not os.path.exists(default_pdf):
        default_pdf = ""

    campaign = Campaign(
        name=payload.get("name", "Export Outreach Campaign"),
        product=payload.get("product", "Singing Bowls"),
        category=payload.get("category", "Handicrafts & Wellness"),
        export_availability=payload.get("export_availability", "Worldwide Export"),
        customization_options=payload.get("customization_options", "OEM / Custom Packaging"),
        min_order_quantity=payload.get("min_order_quantity", "50 Units"),
        shipping_availability=payload.get("shipping_availability", "Air Cargo / Sea Freight"),
        sender_name=payload.get("sender_name", "Export Sales Director"),
        sender_company=payload.get("sender_company", "Global Enterprise Ltd"),
        sender_email=payload.get("sender_email", "export@globalenterprise.com"),
        sender_phone=payload.get("sender_phone", "+1 (800) 555-0199"),
        subject=payload.get("subject", "Export Partnership Opportunity – {product_name}"),
        body_template=payload.get("body_template", ""),
        target_audience=payload.get("target_audience", "All Valid"),
        sending_limit=int(payload.get("sending_limit", 25)),
        delay_seconds=int(payload.get("delay_seconds", 5)),
        attachment_path=payload.get("attachment_path", default_pdf),
        status="active"
    )

    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign.to_dict()


@app.get("/api/campaigns")
def list_campaigns(db: Session = Depends(get_db)):
    camps = db.query(Campaign).order_by(Campaign.id.desc()).all()
    return [c.to_dict() for c in camps]


@app.get("/api/campaigns/{campaign_id}")
def get_campaign_detail(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c.to_dict()


@app.post("/api/campaigns/{campaign_id}/send")
def send_campaign_endpoint(campaign_id: int, payload: dict = None, db: Session = Depends(get_db)):
    """
    Dispatch Outreach Campaign.
    Routing: oauth → Gmail REST API | live → Gmail SMTP | simulation → sandbox log
    """
    buyer_ids = (payload or {}).get("buyer_ids")

    smtp_config = {
        "mode":         SYSTEM_SETTINGS["gmail_mode"],
        "host":         "smtp.gmail.com",
        "port":         587,
        "username":     SYSTEM_SETTINGS["gmail_username"],
        "password":     SYSTEM_SETTINGS["gmail_password"],
        "access_token": SYSTEM_SETTINGS.get("gmail_access_token", ""),
    }

    res = execute_campaign_batch(
        db=db,
        campaign_id=campaign_id,
        smtp_config=smtp_config,
        buyer_ids=buyer_ids
    )

    return res


@app.get("/api/campaigns/{campaign_id}/logs")
def get_campaign_logs(campaign_id: int, db: Session = Depends(get_db)):
    logs = db.query(EmailLog).filter(EmailLog.campaign_id == campaign_id).order_by(EmailLog.id.desc()).all()
    return [l.to_dict() for l in logs]


@app.get("/api/logs")
def get_all_email_logs(limit: int = 50, db: Session = Depends(get_db)):
    """
    Returns real-time email outreach activity logs across all campaigns.
    """
    logs = db.query(EmailLog).order_by(EmailLog.id.desc()).limit(limit).all()
    return [l.to_dict() for l in logs]



# --- SETTINGS & DASHBOARD REPORTING ---

# --- GMAIL OAUTH ENDPOINTS ---

@app.get("/api/gmail/oauth/url")
def get_google_oauth_url():
    """
    Returns Google OAuth 2.0 authorization URL for Gmail API access.
    """
    client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
    redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/gmail/oauth/callback")
    scope = "https://www.googleapis.com/auth/gmail.send"

    if not client_id:
        return {"error": "GOOGLE_CLIENT_ID is not configured in .env"}

    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}&"
        f"redirect_uri={urllib.parse.quote(redirect_uri)}&"
        f"response_type=code&"
        f"scope={urllib.parse.quote(scope)}&"
        f"access_type=offline&"
        f"prompt=consent"
    )

    return {
        "status": "success",
        "auth_url": auth_url,
        "client_id": client_id,
        "redirect_uri": redirect_uri
    }


@app.get("/api/gmail/oauth/callback")
def google_oauth_callback(code: str = None, error: str = None):
    """
    Google OAuth callback: exchanges code → access/refresh tokens and
    redirects user to the Next.js dashboard.
    """
    from fastapi.responses import RedirectResponse
    import httpx as _httpx

    if error:
        return RedirectResponse(url=f"http://localhost:3000/dashboard?oauth_error={urllib.parse.quote(error)}")

    if not code:
        return JSONResponse(status_code=400, content={"error": "Authorization code missing"})

    client_id     = os.environ.get("GOOGLE_CLIENT_ID", "")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "")
    redirect_uri  = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/gmail/oauth/callback")

    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code":          code,
        "client_id":     client_id,
        "client_secret": client_secret,
        "redirect_uri":  redirect_uri,
        "grant_type":    "authorization_code",
    }

    try:
        with _httpx.Client(timeout=12.0) as hclient:
            res = hclient.post(token_url, data=token_payload)
            if res.status_code == 200:
                token_data = res.json()
                SYSTEM_SETTINGS["gmail_access_token"]  = token_data.get("access_token", "")
                SYSTEM_SETTINGS["gmail_refresh_token"] = token_data.get("refresh_token", "")
                SYSTEM_SETTINGS["gmail_mode"]          = "oauth"
                print(f"[OAuth] Gmail connected successfully. Mode = oauth")
                return RedirectResponse(url="http://localhost:3000/dashboard?oauth=success")
            else:
                err_msg = res.json().get("error_description", res.text)
                print(f"[OAuth] Token exchange failed: {err_msg}")
                return RedirectResponse(url=f"http://localhost:3000/dashboard?oauth_error={urllib.parse.quote(err_msg)}")
    except Exception as e:
        print(f"[OAuth] Exception during token exchange: {e}")

    return RedirectResponse(url="http://localhost:3000/dashboard?oauth_error=exchange_failed")


@app.get("/api/gmail/status")
def gmail_status():
    """Returns current Gmail connection mode and whether a token is present."""
    mode         = SYSTEM_SETTINGS.get("gmail_mode", "simulation")
    has_token    = bool(SYSTEM_SETTINGS.get("gmail_access_token"))
    has_username = bool(SYSTEM_SETTINGS.get("gmail_username"))
    return {
        "mode":           mode,
        "oauth_connected": has_token,
        "smtp_configured": has_username,
        "ready":          has_token or has_username or mode == "simulation",
        "email":          SYSTEM_SETTINGS.get("gmail_username", ""),
    }



@app.post("/api/settings/gmail")
def update_gmail_settings(payload: dict):
    username = payload.get("username", "").strip()
    password = payload.get("password", "").strip()
    mode = payload.get("mode", "simulation")

    SYSTEM_SETTINGS["gmail_username"] = username
    SYSTEM_SETTINGS["gmail_password"] = password
    SYSTEM_SETTINGS["gmail_mode"] = mode

    if payload.get("gemini_api_key"):
        SYSTEM_SETTINGS["gemini_api_key"] = payload.get("gemini_api_key").strip()

    return {
        "status": "updated",
        "mode": mode,
        "connected": bool(username) or mode == "simulation"
    }



@app.get("/api/reports/summary")
def get_report_summary(db: Session = Depends(get_db)):
    """
    Dashboard metrics summary endpoint.
    """
    total_buyers = db.query(Buyer).count()
    valid_emails = db.query(Buyer).filter(Buyer.validation_status == "valid").count()
    invalid_emails = db.query(Buyer).filter(Buyer.validation_status == "invalid").count()
    duplicates = db.query(Buyer).filter(Buyer.validation_status == "duplicate").count()
    high_priority = db.query(Buyer).filter(Buyer.lead_priority == "High").count()

    total_sent = db.query(EmailLog).filter(EmailLog.status == "sent").count()
    total_failed = db.query(EmailLog).filter(EmailLog.status == "failed").count()
    total_skipped = db.query(EmailLog).filter(EmailLog.status == "skipped").count()

    importers_count = db.query(Buyer).filter(Buyer.business_type == "Importer").count()
    distributors_count = db.query(Buyer).filter(Buyer.business_type == "Distributor").count()
    wholesalers_count = db.query(Buyer).filter(Buyer.business_type == "Wholesaler").count()
    retailers_count = db.query(Buyer).filter(Buyer.business_type == "Retailer").count()

    return {
        "total_buyers": total_buyers,
        "valid_emails": valid_emails,
        "invalid_emails": invalid_emails,
        "duplicates": duplicates,
        "high_priority": high_priority,
        "total_sent": total_sent,
        "total_failed": total_failed,
        "total_skipped": total_skipped,
        "breakdown": {
            "importers": importers_count,
            "distributors": distributors_count,
            "wholesalers": wholesalers_count,
            "retailers": retailers_count
        },
        "gmail_connected": bool(SYSTEM_SETTINGS["gmail_username"]) or SYSTEM_SETTINGS["gmail_mode"] == "simulation",
        "gmail_mode": SYSTEM_SETTINGS["gmail_mode"]
    }


@app.get("/api/reports/export-csv")
def export_buyers_csv(db: Session = Depends(get_db)):
    """
    Step 8: Export records to CSV format.
    """
    buyers = db.query(Buyer).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Contact Name", "Company Name", "Email", "Website", "Country",
        "Business Type", "Source Platform", "Source URL", "Target Product",
        "Lead Score", "Priority", "Validation Status", "Contacted"
    ])

    for b in buyers:
        writer.writerow([
            b.id, b.name, b.company, b.email, b.website, b.country,
            b.business_type, b.source, b.source_url, b.product,
            b.lead_score, b.lead_priority, b.validation_status, b.is_contacted
        ])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ExportReach_Buyer_Leads.csv"}
    )


# Serve frontend static files
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    def read_root():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
