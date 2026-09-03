import os
import sys
import time
import pytest
from fastapi.testclient import TestClient

# Add backend directory to Python sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "..", "backend")
sys.path.insert(0, BACKEND_DIR)

from main import app
from database import init_db, SessionLocal, Buyer, Campaign, EmailLog, ContactHistory
from services.buyer_discovery import generate_search_queries, discover_buyers
from services.data_validator import validate_email_format, normalize_email, clean_and_validate_buyers
from services.ai_classifier import classify_lead_with_fallback, batch_classify_buyers
from services.email_sender import render_email_template, send_single_email, execute_campaign_batch

client = TestClient(app)


def setup_module(module):
    init_db()


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["system"] == "ExportReach AI"


def test_search_query_generation():
    queries = generate_search_queries("Singing Bowls", ["USA", "UK"], ["Importer", "Distributor"])
    assert len(queries) == 4
    assert '"Singing Bowls" importer USA' in queries
    assert '"Singing Bowls" distributor UK' in queries


def test_buyer_discovery_engine():
    res = discover_buyers(product_name="Singing Bowls", target_countries=["USA", "UK"], buyer_types=["Importer"], max_results=10)
    assert res["total_found"] == 10
    assert len(res["buyers"]) == 10
    first = res["buyers"][0]
    assert "company" in first
    assert "email" in first
    assert "country" in first


def test_email_validator_and_normalizer():
    valid, msg = validate_email_format("john.doe@abcimports.com")
    assert valid is True

    invalid, msg = validate_email_format("invalid-email-without-at")
    assert invalid is False

    norm = normalize_email("  JOHN.DOE@ABC.COM ")
    assert norm == "john.doe@abc.com"


def test_data_cleaning_and_deduplication():
    db = SessionLocal()
    raw_sample = [
        {"name": "John", "company": "ABC Imports", "email": "john@abc.com", "country": "USA", "business_type": "Importer"},
        {"name": "John Duplicate", "company": "ABC Imports", "email": "JOHN@ABC.COM", "country": "USA", "business_type": "Importer"}, # Duplicate
        {"name": "Bad Email", "company": "X Corp", "email": "bad-email-format", "country": "UK", "business_type": "Distributor"}, # Invalid
    ]

    res = clean_and_validate_buyers(db, raw_sample)
    assert res["valid_count"] == 1
    assert res["duplicate_count"] == 1
    assert res["invalid_count"] == 1
    db.close()


def test_ai_lead_classification():
    buyer = {
        "company": "Zen Harmony Wellness",
        "business_type": "Importer",
        "country": "USA",
        "website": "https://www.zenharmony.com",
        "product": "Singing Bowls",
        "name": "Sarah Miller"
    }

    ai_res = classify_lead_with_fallback(buyer)
    assert ai_res["lead_priority"] in ["High", "Medium"]
    assert ai_res["lead_score"] >= 80
    assert "import" in ai_res["pitch_snippet"].lower()


def test_email_template_compilation():
    buyer = {
        "name": "David Thorne",
        "company": "Sacred Sound Imports",
        "country": "Canada",
        "website": "https://sacredsound.ca",
        "source": "Google",
        "product": "Singing Bowls"
    }
    campaign = {
        "product": "Singing Bowls",
        "category": "Wellness",
        "export_availability": "Worldwide",
        "customization_options": "OEM Available",
        "min_order_quantity": "50 Units",
        "shipping_availability": "Air Cargo",
        "sender_name": "Export Director",
        "sender_company": "Global Export Co",
        "sender_email": "sales@global.com",
        "sender_phone": "+1 800 555 0199"
    }

    rendered = render_email_template("", buyer, campaign)
    assert "Dear David Thorne" in rendered
    assert "Sacred Sound Imports" in rendered
    assert "Singing Bowls" in rendered
    assert "Export Director" in rendered


def test_campaign_dispatch_and_duplicate_prevention():
    db = SessionLocal()

    unique_email = f"testbuyer_{int(time.time())}@example.com"
    b = Buyer(
        name="Test Buyer",
        company="Test Company",
        email=unique_email,
        normalized_email=unique_email,
        country="USA",
        business_type="Importer",
        email_valid=True,
        validation_status="valid",
        is_contacted=False
    )
    db.add(b)
    db.commit()
    db.refresh(b)

    # Create dummy campaign
    c = Campaign(
        name="Unit Test Campaign",
        product="Singing Bowls",
        subject="Test Opportunity",
        body_template="Hello {{buyer_name}}",
        target_audience="All Valid",
        sending_limit=10,
        delay_seconds=0
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    smtp_config = {"mode": "simulation"}

    # Run 1st execution: Should send
    res1 = execute_campaign_batch(db, c.id, smtp_config, buyer_ids=[b.id])
    assert res1["sent_count"] == 1
    assert res1["skipped_count"] == 0

    # Run 2nd execution: Should skip duplicate
    res2 = execute_campaign_batch(db, c.id, smtp_config, buyer_ids=[b.id])
    assert res2["sent_count"] == 0
    assert res2["skipped_count"] == 1

    db.close()


def test_summary_report_endpoint():
    res = client.get("/api/reports/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_buyers" in data
    assert "valid_emails" in data
    assert "high_priority" in data
