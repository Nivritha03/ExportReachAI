"""
End-to-end pipeline test for ExportReach AI:
1. Discover real buyers via SerpAPI
2. Run simulation campaign → verify sent/failed/skipped
3. Print full verification table
"""
import urllib.request
import json
import sys

BASE = "http://127.0.0.1:8000"

def api(method, path, data=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method=method)
    try:
        res = urllib.request.urlopen(req, timeout=90)
        return json.loads(res.read())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code} on {method} {path}: {e.read().decode()[:400]}")
        sys.exit(1)

# ── STAGE 1: Real buyer discovery (SerpAPI only) ─────────────────────────────
print("\n══════════════════════════════════════════")
print("STAGE 1 — REAL BUYER DISCOVERY (SerpAPI)")
print("══════════════════════════════════════════")
r1 = api("POST", "/api/buyers/discover", {
    "product": "Singing Bowls",
    "countries": ["USA", "UK", "Germany", "UAE"],
    "buyer_types": ["Importer", "Distributor", "Wholesaler", "Retailer"],
    "limit": 20
})
buyers = r1.get("buyers", [])
print(f"Total Found   : {r1.get('total_found', 0)}")
print(f"New in DB     : {r1.get('new_inserted', 0)}")
print(f"Duplicates    : {r1.get('duplicates', 0)}")
print(f"Verified      : {r1.get('verified', 0)}")
print()

# Print field-by-field audit for first 3 records
REQUIRED_FIELDS = ["name","company","email","website","country","business_type","source","source_url","validation_status","lead_score","lead_priority"]
print("─── Field Audit (first 3 buyers) ─────────────────────────────────────")
for i, b in enumerate(buyers[:3]):
    print(f"\nBuyer #{i+1}")
    for f in REQUIRED_FIELDS:
        v = b.get(f, "MISSING")
        flag = "✓" if v and v != "MISSING" else "✗"
        print(f"  {flag} {f:22s}: {v}")

# ── STAGE 2: Deduplication test ──────────────────────────────────────────────
print("\n══════════════════════════════════════════")
print("STAGE 2 — DUPLICATE PREVENTION")
print("══════════════════════════════════════════")
r2 = api("POST", "/api/buyers/discover", {
    "product": "Singing Bowls",
    "countries": ["USA"],
    "buyer_types": ["Importer"],
    "limit": 5
})
print(f"Run 2 New Inserted   : {r2.get('new_inserted', 0)}  (should be low / zero)")
print(f"Run 2 Duplicates     : {r2.get('duplicates', 0)}   (should reflect existing DB entries)")

# ── STAGE 3: Create campaign + simulate dispatch ─────────────────────────────
print("\n══════════════════════════════════════════")
print("STAGE 3 — CAMPAIGN CREATION & SIMULATION")
print("══════════════════════════════════════════")
camp = api("POST", "/api/campaigns", {
    "name": "Singing Bowls – Global Export Campaign",
    "product": "Singing Bowls",
    "sending_limit": 10,
    "delay_seconds": 0,
    "sender_name": "Export Manager",
    "sender_company": "HandiCraft Exports Ltd",
    "sender_email": "exports@handicraftexports.com",
    "subject": "Export Partnership Opportunity – {product_name}",
})
cid = camp["id"]
print(f"Campaign ID created  : {cid}")
print(f"Campaign Name        : {camp['name']}")
print(f"Sending Limit        : {camp['sending_limit']}")

send_r = api("POST", f"/api/campaigns/{cid}/send", {})
print(f"\nDispatch Results:")
print(f"  Total Processed : {send_r.get('total_processed', 0)}")
print(f"  Sent            : {send_r.get('sent_count', 0)}")
print(f"  Failed          : {send_r.get('failed_count', 0)}")
print(f"  Skipped         : {send_r.get('skipped_count', 0)}")
print(f"  Mode            : {send_r.get('mode', '?')}")

# Print first log entry
logs = send_r.get("logs", [])
if logs:
    print(f"\n  Sample Log Entry:")
    l = logs[0]
    print(f"    Recipient  : {l.get('recipient_email')}")
    print(f"    Status     : {l.get('status')}")
    print(f"    Attachment : {l.get('attachment_used')}")

# ── STAGE 4: Reports summary ─────────────────────────────────────────────────
print("\n══════════════════════════════════════════")
print("STAGE 4 — DASHBOARD SUMMARY")
print("══════════════════════════════════════════")
rpt = api("GET", "/api/reports/summary")
print(f"  Buyers in DB     : {rpt.get('total_buyers')}")
print(f"  High Priority    : {rpt.get('high_priority')}")
print(f"  Total Sent       : {rpt.get('total_sent')}")
print(f"  Total Failed     : {rpt.get('total_failed')}")
print(f"  Total Skipped    : {rpt.get('total_skipped')}")
print(f"  Gmail Mode       : {rpt.get('gmail_mode')}")
print(f"  Gmail Connected  : {rpt.get('gmail_connected')}")

# ── STAGE 5: Gmail OAuth URL ─────────────────────────────────────────────────
print("\n══════════════════════════════════════════")
print("STAGE 5 — GMAIL OAUTH URL")
print("══════════════════════════════════════════")
oauth_r = api("GET", "/api/gmail/oauth/url")
if "auth_url" in oauth_r:
    print(f"  Open this URL in browser to connect Gmail:\n")
    print(f"  {oauth_r['auth_url'][:120]}...")
else:
    print(f"  Error: {oauth_r}")

print("\n══════════════════════════════════════════")
print("ALL STAGES COMPLETE ✓")
print("══════════════════════════════════════════\n")
