import os
import json
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "exportreach.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="")
    company = Column(String(255), index=True)
    email = Column(String(255), index=True)
    normalized_email = Column(String(255), index=True)
    website = Column(String(500), default="")
    country = Column(String(100), default="Global")
    business_type = Column(String(100), default="Importer") # Importer, Distributor, Wholesaler, Retailer, Individual
    source = Column(String(100), default="Google")
    source_url = Column(String(500), default="")
    product = Column(String(255), default="")
    
    lead_score = Column(Integer, default=50) # 0 to 100
    lead_priority = Column(String(50), default="Medium") # High, Medium, Low
    ai_classification = Column(Text, default="{}") # JSON string containing reason, personalized_pitch, category
    
    email_valid = Column(Boolean, default=True)
    validation_status = Column(String(50), default="valid") # valid, invalid, duplicate, manual_review
    is_contacted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        try:
            ai_data = json.loads(self.ai_classification) if self.ai_classification else {}
        except Exception:
            ai_data = {}

        return {
            "id": self.id,
            "name": self.name or "Purchase Manager",
            "company": self.company,
            "email": self.email,
            "normalized_email": self.normalized_email,
            "website": self.website,
            "country": self.country,
            "business_type": self.business_type,
            "source": self.source,
            "source_url": self.source_url,
            "product": self.product,
            "lead_score": self.lead_score,
            "lead_priority": self.lead_priority,
            "ai_classification": ai_data,
            "email_valid": self.email_valid,
            "validation_status": self.validation_status,
            "is_contacted": self.is_contacted,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    product = Column(String(255))
    category = Column(String(255), default="Handicrafts & Wellness")
    export_availability = Column(String(255), default="Worldwide Export")
    customization_options = Column(String(255), default="OEM / Custom Logo & Packaging Available")
    min_order_quantity = Column(String(100), default="50 Units")
    shipping_availability = Column(String(255), default="Air Cargo / Sea Freight Available")
    
    sender_name = Column(String(255), default="Export Business Manager")
    sender_company = Column(String(255), default="Global Products Pvt Ltd")
    sender_email = Column(String(255), default="sales@globalexport.com")
    sender_phone = Column(String(100), default="+1 (800) 555-0199")

    subject = Column(String(500), default="Export Partnership Opportunity – {product_name}")
    body_template = Column(Text, default="")
    target_audience = Column(String(100), default="All Valid") # All Valid, High Priority, Importers Only
    sending_limit = Column(Integer, default=25)
    delay_seconds = Column(Integer, default=5)
    attachment_path = Column(String(500), default="")
    status = Column(String(50), default="draft") # draft, active, completed, paused
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "product": self.product,
            "category": self.category,
            "export_availability": self.export_availability,
            "customization_options": self.customization_options,
            "min_order_quantity": self.min_order_quantity,
            "shipping_availability": self.shipping_availability,
            "sender_name": self.sender_name,
            "sender_company": self.sender_company,
            "sender_email": self.sender_email,
            "sender_phone": self.sender_phone,
            "subject": self.subject,
            "body_template": self.body_template,
            "target_audience": self.target_audience,
            "sending_limit": self.sending_limit,
            "delay_seconds": self.delay_seconds,
            "attachment_path": self.attachment_path,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=True)
    recipient_email = Column(String(255))
    buyer_name = Column(String(255))
    company_name = Column(String(255))
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50)) # sent, failed, skipped
    error_message = Column(Text, default="")
    attachment_used = Column(String(255), default="")
    retry_count = Column(Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "buyer_id": self.buyer_id,
            "recipient_email": self.recipient_email,
            "buyer_name": self.buyer_name,
            "company_name": self.company_name,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "status": self.status,
            "error_message": self.error_message,
            "attachment_used": self.attachment_used,
            "retry_count": self.retry_count
        }


class ContactHistory(Base):
    __tablename__ = "contact_history"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=True)
    email = Column(String(255), unique=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    contacted_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="sent")


def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
