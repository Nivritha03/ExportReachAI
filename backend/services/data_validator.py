import re
from sqlalchemy.orm import Session
from database import Buyer, ContactHistory

# RFC 5322 compliant email regex pattern
EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
)

# Common disposable or invalid email domains
INVALID_DOMAINS = {"mailinator.com", "tempmail.com", "10minutemail.com", "test.com", "example.com"}


def validate_email_format(email: str) -> tuple[bool, str]:
    """
    Validates email format using regex, domain checks, and structural rules.
    Returns (is_valid, reason)
    """
    if not email or not isinstance(email, str):
        return False, "Email string is empty or missing"

    clean_email = email.strip()
    if len(clean_email) > 254:
        return False, "Email exceeds maximum length of 254 characters"

    if not EMAIL_REGEX.match(clean_email):
        return False, "Malformed email syntax"

    domain = clean_email.split("@")[-1].lower()
    if domain in INVALID_DOMAINS:
        return False, f"Disposable or test domain ({domain})"

    if not "." in domain or domain.endswith("."):
        return False, "Invalid domain extension"

    return True, "Valid format"


def normalize_email(email: str) -> str:
    """
    Normalizes email address to lowercase stripped format.
    Example: ' JOHN.DOE@ABCImports.COM ' -> 'john.doe@abcimports.com'
    """
    return email.strip().lower() if email else ""


def clean_and_validate_buyers(db: Session, raw_buyers: list) -> dict:
    """
    Performs full validation workflow on buyer records:
    1. Format Validation
    2. Case-Insensitive Normalization
    3. Deduplication (within batch and against database)
    4. Incomplete record isolation (Manual Review)
    5. Contact History duplicate check
    """
    valid_records = []
    invalid_records = []
    duplicate_records = []
    manual_review_records = []
    already_contacted_records = []

    seen_emails_in_batch = set()

    # Query all previously contacted emails from ContactHistory
    contacted_emails = set(
        row[0] for row in db.query(ContactHistory.email).all()
    )

    # Query all existing normalized emails in database
    existing_buyer_emails = set(
        row[0] for row in db.query(Buyer.normalized_email).filter(Buyer.normalized_email.isnot(None)).all()
    )

    for buyer in raw_buyers:
        name = buyer.get("name", "").strip()
        company = buyer.get("company", "").strip()
        email_raw = buyer.get("email", "").strip()
        website = buyer.get("website", "").strip()
        country = buyer.get("country", "Global").strip()
        business_type = buyer.get("business_type", "Importer").strip()
        source = buyer.get("source", "Google").strip()
        source_url = buyer.get("source_url", "").strip()
        product = buyer.get("product", "").strip()

        norm_email = normalize_email(email_raw)
        is_valid_format, reason = validate_email_format(email_raw)

        record_dict = {
            "name": name or "Purchase Manager",
            "company": company,
            "email": email_raw,
            "normalized_email": norm_email,
            "website": website,
            "country": country,
            "business_type": business_type,
            "source": source,
            "source_url": source_url,
            "product": product,
            "reason": reason
        }

        # 1. Invalid Format → keep record but mark needs_review so it still reaches DB
        if not is_valid_format:
            if not email_raw:  # completely missing email — skip
                record_dict["validation_status"] = "invalid"
                record_dict["email_valid"] = False
                invalid_records.append(record_dict)
                continue
            # Malformed but present — flag for review, don't discard
            record_dict["validation_status"] = "needs_review"
            record_dict["email_valid"] = False
            manual_review_records.append(record_dict)
            continue

        # 2. Batch Duplicate check
        if norm_email in seen_emails_in_batch:
            record_dict["validation_status"] = "duplicate"
            record_dict["email_valid"] = True
            duplicate_records.append(record_dict)
            continue

        seen_emails_in_batch.add(norm_email)

        # 3. Already Contacted check
        if norm_email in contacted_emails:
            record_dict["validation_status"] = "already_contacted"
            record_dict["email_valid"] = True
            record_dict["is_contacted"] = True
            already_contacted_records.append(record_dict)
            continue

        # 4. Existing Database Duplicate check
        if norm_email in existing_buyer_emails:
            record_dict["validation_status"] = "duplicate"
            record_dict["email_valid"] = True
            duplicate_records.append(record_dict)
            continue

        # 5. Incomplete Info check (Missing company or name -> Manual Review)
        if not company or not name or name.lower() == "purchase manager":
            record_dict["validation_status"] = "manual_review"
            record_dict["email_valid"] = True
            manual_review_records.append(record_dict)
            valid_records.append(record_dict) # Still valid email, but flagged
            continue

        # 6. Clean Valid Lead
        record_dict["validation_status"] = "valid"
        record_dict["email_valid"] = True
        valid_records.append(record_dict)

    return {
        "total_processed": len(raw_buyers),
        "valid_count": len(valid_records),
        "invalid_count": len(invalid_records),
        "duplicate_count": len(duplicate_records),
        "already_contacted_count": len(already_contacted_records),
        "manual_review_count": len(manual_review_records),
        "valid_records": valid_records,
        "invalid_records": invalid_records,
        "duplicate_records": duplicate_records,
        "already_contacted_records": already_contacted_records,
        "manual_review_records": manual_review_records
    }
