import os
import time
import base64
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email import encoders
from datetime import datetime
from sqlalchemy.orm import Session
from database import Buyer, Campaign, EmailLog, ContactHistory

try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


# ─────────────────────────────────────────────────────────────────────────────
# TEMPLATE RENDERER
# ─────────────────────────────────────────────────────────────────────────────

def render_email_template(template: str, buyer: dict, campaign: dict) -> str:
    """Renders personalised outreach email body."""
    ai_info = buyer.get("ai_classification", {})
    if isinstance(ai_info, str):
        try:
            ai_info = json.loads(ai_info)
        except Exception:
            ai_info = {}
    pitch = ai_info.get("pitch_snippet", "") if isinstance(ai_info, dict) else ""

    buyer_name   = buyer.get("name") or "Purchase Manager"
    company_name = buyer.get("company") or "Import Business"
    country      = buyer.get("country") or "Global"
    website      = buyer.get("website") or "N/A"
    source       = buyer.get("source") or "Google"
    product_name = campaign.get("product") or buyer.get("product") or "Singing Bowls"

    category      = campaign.get("category", "Handicrafts & Wellness")
    export_avail  = campaign.get("export_availability", "Worldwide Export")
    customization = campaign.get("customization_options", "OEM / Custom Logo & Packaging Available")
    moq           = campaign.get("min_order_quantity", "50 Units")
    shipping      = campaign.get("shipping_availability", "Air Cargo / Sea Freight Available")
    sender_name   = campaign.get("sender_name", "Export Sales Director")
    sender_company= campaign.get("sender_company", "Global Export Enterprises")
    sender_email  = campaign.get("sender_email", "export@globalenterprise.com")
    sender_phone  = campaign.get("sender_phone", "+1 (800) 555-0199")

    default_body = f"""Dear {buyer_name},

I hope this message finds you well.

We came across {company_name} while researching {buyer_name.split()[0]}'s work in the {product_name} space, and I'd love to explore a potential supply partnership.

{pitch}

About our {product_name} offering:
• Product Category   : {category}
• Export Availability: {export_avail}
• Customization      : {customization}
• Minimum Order Qty  : {moq}
• Shipping           : {shipping}

Please find our Company Presentation attached for full product details, pricing, and certifications.

We would be delighted to discuss how we can serve {company_name}'s procurement needs.

Warm regards,
{sender_name}
{sender_company}
{sender_email}
{sender_phone}"""

    if not template or len(template.strip()) < 10:
        return default_body

    replacements = {
        "{{buyer_name}}":          buyer_name,
        "{{company_name}}":        company_name,
        "{{country}}":             country,
        "{{website}}":             website,
        "{{source}}":              source,
        "{{product_name}}":        product_name,
        "{{category}}":            category,
        "{{export_availability}}": export_avail,
        "{{customization_options}}": customization,
        "{{min_order_quantity}}":  moq,
        "{{shipping_availability}}": shipping,
        "{{sender_name}}":         sender_name,
        "{{sender_company}}":      sender_company,
        "{{sender_email}}":        sender_email,
        "{{sender_phone}}":        sender_phone,
        "{{pitch_snippet}}":       pitch,
    }
    rendered = template
    for tag, val in replacements.items():
        rendered = rendered.replace(tag, str(val))
    return rendered


# ─────────────────────────────────────────────────────────────────────────────
# BUILD MIME MESSAGE
# ─────────────────────────────────────────────────────────────────────────────

def _build_mime_message(sender_email: str, recipient_email: str,
                         subject: str, body_text: str,
                         pdf_attachment_path: str = None) -> MIMEMultipart:
    msg = MIMEMultipart()
    msg["From"]    = sender_email
    msg["To"]      = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body_text, "plain", "utf-8"))

    if pdf_attachment_path and os.path.exists(pdf_attachment_path):
        filename = os.path.basename(pdf_attachment_path)
        with open(pdf_attachment_path, "rb") as f:
            pdf_part = MIMEApplication(f.read(), _subtype="pdf")
            pdf_part.add_header("Content-Disposition", "attachment", filename=filename)
            msg.attach(pdf_part)
    return msg


# ─────────────────────────────────────────────────────────────────────────────
# GMAIL API SEND (OAuth access_token)
# ─────────────────────────────────────────────────────────────────────────────

def _send_via_gmail_api(access_token: str, sender_email: str,
                         recipient_email: str, subject: str,
                         body_text: str, pdf_attachment_path: str = None) -> tuple:
    """
    Sends an email via Gmail REST API using an OAuth access token.
    Does NOT store or use any password.
    """
    if not HTTPX_AVAILABLE:
        return False, "httpx library not installed"

    msg = _build_mime_message(sender_email, recipient_email, subject, body_text, pdf_attachment_path)
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")

    url     = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type":  "application/json",
    }
    payload = {"raw": raw}

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code in (200, 201):
                data = resp.json()
                return True, f"Sent via Gmail API | Message ID: {data.get('id', 'N/A')}"
            else:
                err = resp.json().get("error", {})
                return False, f"Gmail API Error {resp.status_code}: {err.get('message', resp.text)}"
    except Exception as e:
        return False, f"Gmail API exception: {str(e)}"


# ─────────────────────────────────────────────────────────────────────────────
# SMTP FALLBACK SEND
# ─────────────────────────────────────────────────────────────────────────────

def _send_via_smtp(smtp_config: dict, recipient_email: str, subject: str,
                   body_text: str, pdf_attachment_path: str = None) -> tuple:
    host     = smtp_config.get("host", "smtp.gmail.com")
    port     = int(smtp_config.get("port", 587))
    username = smtp_config.get("username", "")
    password = smtp_config.get("password", "")

    if not username or not password:
        return False, "SMTP credentials missing"

    try:
        msg = _build_mime_message(username, recipient_email, subject, body_text, pdf_attachment_path)
        server = smtplib.SMTP(host, port, timeout=12)
        server.starttls()
        server.login(username, password)
        server.send_message(msg)
        server.quit()
        return True, "Sent via Gmail SMTP"
    except Exception as e:
        return False, f"SMTP Error: {str(e)}"


# ─────────────────────────────────────────────────────────────────────────────
# UNIFIED SEND DISPATCHER
# ─────────────────────────────────────────────────────────────────────────────

def send_single_email(smtp_config: dict, recipient_email: str, subject: str,
                      body_text: str, pdf_attachment_path: str = None) -> tuple:
    """
    Sends a single email. Routing:
      - mode == 'simulation' → log without actually sending
      - mode == 'oauth'      → Gmail REST API (OAuth token)
      - mode == 'live'       → Gmail SMTP (App password)
    """
    mode = smtp_config.get("mode", "simulation")

    if mode == "simulation":
        time.sleep(0.15)
        return True, "Simulated send (sandbox mode)"

    if mode == "oauth":
        access_token = smtp_config.get("access_token", "")
        sender_email = smtp_config.get("username", "")
        if not access_token:
            return False, "OAuth access_token not set. Complete Gmail OAuth login first."
        return _send_via_gmail_api(
            access_token, sender_email, recipient_email,
            subject, body_text, pdf_attachment_path
        )

    # Default: SMTP (live)
    return _send_via_smtp(smtp_config, recipient_email, subject, body_text, pdf_attachment_path)


# ─────────────────────────────────────────────────────────────────────────────
# CAMPAIGN BATCH EXECUTOR
# ─────────────────────────────────────────────────────────────────────────────

def execute_campaign_batch(db: Session, campaign_id: int,
                           smtp_config: dict, buyer_ids: list = None) -> dict:
    """
    Dispatches outreach campaign to all qualified buyers.
    • Continues through failures (no campaign-wide abort)
    • Retries once per recipient on failure
    • Logs sent / failed / skipped individually
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        return {"error": "Campaign not found"}

    camp_dict = campaign.to_dict()

    # ── Buyer query ──────────────────────────────────────────────────────────
    query = db.query(Buyer).filter(Buyer.email_valid == True)
    if buyer_ids:
        query = query.filter(Buyer.id.in_(buyer_ids))
    if campaign.target_audience == "High Priority Only":
        query = query.filter(Buyer.lead_priority == "High")
    elif campaign.target_audience == "Importers Only":
        query = query.filter(Buyer.business_type == "Importer")

    buyers = query.limit(campaign.sending_limit).all()

    # ── Previously contacted set (normalised) ────────────────────────────────
    contacted_emails = set(row[0] for row in db.query(ContactHistory.email).all())

    sent_count = failed_count = skipped_count = 0
    logs = []

    for idx, buyer in enumerate(buyers):
        norm_email   = (buyer.normalized_email or buyer.email or "").lower().strip()
        buyer_dict   = buyer.to_dict()
        attach_name  = os.path.basename(campaign.attachment_path) if campaign.attachment_path else "Company_Presentation.pdf"

        # ── Skip already-contacted ───────────────────────────────────────────
        if norm_email in contacted_emails or buyer.is_contacted:
            skipped_count += 1
            db.add(EmailLog(
                campaign_id=campaign.id, buyer_id=buyer.id,
                recipient_email=buyer.email, buyer_name=buyer.name,
                company_name=buyer.company, status="skipped",
                error_message="Already contacted previously",
                attachment_used=attach_name
            ))
            db.commit()
            continue

        # ── Render personalised content ──────────────────────────────────────
        subject = campaign.subject.replace("{product_name}", campaign.product or buyer.product or "Products")
        body    = render_email_template(campaign.body_template, buyer_dict, camp_dict)

        # ── Send (with one retry) ────────────────────────────────────────────
        success, msg_out = send_single_email(
            smtp_config=smtp_config,
            recipient_email=buyer.email,
            subject=subject,
            body_text=body,
            pdf_attachment_path=campaign.attachment_path
        )
        if not success:
            time.sleep(1.5)
            success, msg_out = send_single_email(
                smtp_config=smtp_config,
                recipient_email=buyer.email,
                subject=subject,
                body_text=body,
                pdf_attachment_path=campaign.attachment_path
            )

        # ── Record outcome (never abort loop on per-email failure) ───────────
        if success:
            sent_count += 1
            buyer.is_contacted = True
            db.add(ContactHistory(
                buyer_id=buyer.id, email=norm_email,
                campaign_id=campaign.id, status="sent"
            ))
            log_status  = "sent"
            log_err_msg = ""
        else:
            failed_count += 1
            log_status  = "failed"
            log_err_msg = msg_out

        log_entry = EmailLog(
            campaign_id=campaign.id, buyer_id=buyer.id,
            recipient_email=buyer.email, buyer_name=buyer.name,
            company_name=buyer.company, status=log_status,
            error_message=log_err_msg, attachment_used=attach_name
        )
        db.add(log_entry)
        db.commit()
        logs.append(log_entry.to_dict())

        # ── Rate-limiting delay ──────────────────────────────────────────────
        if idx < len(buyers) - 1 and campaign.delay_seconds > 0:
            time.sleep(campaign.delay_seconds)

    campaign.status = "completed"
    db.commit()

    return {
        "campaign_id":     campaign.id,
        "total_processed": len(buyers),
        "sent_count":      sent_count,
        "failed_count":    failed_count,
        "skipped_count":   skipped_count,
        "mode":            smtp_config.get("mode", "simulation"),
        "logs":            logs,
    }
