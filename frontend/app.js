/* ==========================================================================
   ExportReach AI - Single Page Application Script
   ========================================================================== */

const API_BASE = "http://localhost:8000/api";

// Global App State
const state = {
    discoveredBuyers: [],
    validatedBuyers: [],
    classifiedBuyers: [],
    databaseBuyers: [],
    activeCampaign: null,
    currentPresentationPath: "",
    gmailMode: "simulation"
};

document.addEventListener("DOMContentLoaded", () => {
    initNavigationTabs();
    initTagToggles();
    fetchDashboardMetrics();
    fetchDatabaseBuyers();
    updateEmailPreview();
    fetchSystemHealth();
});

// --- NAVIGATION TABS ---
function initNavigationTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            switchTab(tab.dataset.tab);
        });
    });
}

function switchTab(tabName) {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    const btn = document.querySelector(`[data-tab="${tabName}"]`);
    if (btn) btn.classList.add("active");
    const targetElem = document.getElementById(`tab-${tabName}`);
    if (targetElem) {
        targetElem.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

function scrollToQuickSearch() {
    const el = document.getElementById("quick-search-box");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

function quickSearchCountry(country) {
    document.getElementById("disc-countries").value = country;
    switchTab("discovery");
    runDiscoverySearch();
}

function initTagToggles() {
    document.querySelectorAll(".country-tags .tag").forEach(tag => {
        tag.addEventListener("click", () => {
            tag.classList.toggle("active");
        });
    });
}

// --- API FETCH HELPERS ---
async function fetchSystemHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        const badge = document.getElementById("gmail-status-text");
        if (badge) {
            badge.innerText = data.gmail_mode === "live" ? "Gmail: Connected (Live SMTP)" : "Gmail: Connected (Sandbox)";
        }
    } catch (e) {
        console.warn("Backend API connecting...", e);
    }
}

async function fetchDashboardMetrics() {
    try {
        const res = await fetch(`${API_BASE}/reports/summary`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById("kpi-total-buyers").innerText = data.total_buyers || 0;
            document.getElementById("kpi-valid-emails").innerText = data.valid_emails || 0;
            document.getElementById("kpi-high-priority").innerText = data.high_priority || 0;
            document.getElementById("kpi-sent-emails").innerText = data.total_sent || 0;
        }
    } catch (e) {
        console.error("Error fetching metrics:", e);
    }
}

async function fetchDatabaseBuyers() {
    try {
        const res = await fetch(`${API_BASE}/buyers`);
        if (res.ok) {
            const buyers = await res.json();
            state.databaseBuyers = buyers;
            renderRecentLeadsTable(buyers);
            renderQualificationTable(buyers);
        }
    } catch (e) {
        console.error("Error fetching database buyers:", e);
    }
}

// --- RENDER RECENT LEADS & QUALIFICATION TABLES ---
function renderRecentLeadsTable(buyers) {
    const tbody = document.getElementById("recent-leads-tbody");
    if (!tbody) return;

    if (!buyers || buyers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No buyer leads found. Use Buyer Discovery tab to search.</td></tr>`;
        return;
    }

    tbody.innerHTML = buyers.slice(0, 10).map(b => `
        <tr>
            <td><strong>${escapeHtml(b.company)}</strong><br><small class="text-muted">${escapeHtml(b.email)}</small></td>
            <td>${escapeHtml(b.name || 'Purchase Manager')}</td>
            <td>${escapeHtml(b.country)}</td>
            <td><span class="badge badge-cyan">${escapeHtml(b.business_type)}</span></td>
            <td><strong class="text-gold">⭐ ${b.lead_score}/100</strong></td>
            <td>
                ${b.validation_status === 'valid' ? '<span class="badge badge-green">Valid Email</span>' :
                  b.validation_status === 'duplicate' ? '<span class="badge badge-gold">Duplicate</span>' :
                  '<span class="badge badge-purple">Manual Review</span>'}
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="inspectAIModal(${b.id})">
                    <i class="fa-solid fa-brain"></i> AI Insights
                </button>
            </td>
        </tr>
    `).join("");
}

function renderQualificationTable(buyers) {
    const tbody = document.getElementById("qual-table-tbody");
    if (!tbody) return;

    if (!buyers || buyers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No buyers found for qualification.</td></tr>`;
        return;
    }

    tbody.innerHTML = buyers.map(b => `
        <tr class="qual-row" data-status="${b.validation_status}" data-priority="${b.lead_priority}">
            <td><strong>${escapeHtml(b.company)}</strong></td>
            <td>${escapeHtml(b.email)}</td>
            <td>${escapeHtml(b.country)}</td>
            <td><span class="badge badge-cyan">${escapeHtml(b.business_type)}</span></td>
            <td><strong class="text-gold">⭐ ${b.lead_score}</strong></td>
            <td>
                ${b.lead_priority === 'High' ? '<span class="badge badge-purple">High Priority</span>' :
                  b.lead_priority === 'Medium' ? '<span class="badge badge-cyan">Medium</span>' :
                  '<span class="badge badge-gold">Low Priority</span>'}
            </td>
            <td>
                ${b.validation_status === 'valid' ? '<span class="badge badge-green">Valid</span>' :
                  b.validation_status === 'invalid' ? '<span class="badge badge-red">Invalid Format</span>' :
                  b.validation_status === 'duplicate' ? '<span class="badge badge-gold">Duplicate</span>' :
                  '<span class="badge badge-purple">Manual Review</span>'}
            </td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="inspectAIModal(${b.id})">
                    <i class="fa-solid fa-circle-info"></i> View Analysis
                </button>
            </td>
        </tr>
    `).join("");
}

function filterQualificationTable(filterKey) {
    document.querySelectorAll(".filter-pills .pill").forEach(p => p.classList.remove("active"));
    event.target.classList.add("active");

    const rows = document.querySelectorAll(".qual-row");
    rows.forEach(row => {
        const status = row.dataset.status;
        const priority = row.dataset.priority;

        if (filterKey === "all") {
            row.style.display = "";
        } else if (filterKey === "High") {
            row.style.display = priority === "High" ? "" : "none";
        } else {
            row.style.display = status === filterKey ? "" : "none";
        }
    });
}

// --- STEP 1 & 2: BUYER DISCOVERY ENGINE ---
async function runDiscoverySearch() {
    const product = document.getElementById("disc-product").value.trim();
    const countriesStr = document.getElementById("disc-countries").value.trim();
    const maxResults = document.getElementById("disc-max-results").value;

    if (!product) {
        alert("Please enter a target export product name.");
        return;
    }

    const countries = countriesStr ? countriesStr.split(",").map(c => c.trim()) : ["USA", "UK", "Germany"];
    const buyerTypes = Array.from(document.querySelectorAll(".disc-type:checked")).map(cb => cb.value);

    const btn = document.getElementById("btn-run-discovery");
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Discovering Buyers...`;

    try {
        const res = await fetch(`${API_BASE}/buyers/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_name: product,
                target_countries: countries,
                buyer_types: buyerTypes,
                max_results: parseInt(maxResults)
            })
        });

        if (res.ok) {
            const data = await res.json();
            state.discoveredBuyers = data.buyers || [];
            renderDiscoveryResults(state.discoveredBuyers);
            document.getElementById("disc-count").innerText = state.discoveredBuyers.length;
        } else {
            alert("Discovery search failed. Please try again.");
        }
    } catch (e) {
        console.error("Discovery Search Error:", e);
        alert("Error executing buyer search.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Search Buyers & Extract Contacts`;
    }
}

function executeQuickSearch() {
    const prod = document.getElementById("quick-product-input").value;
    document.getElementById("disc-product").value = prod;
    switchTab("discovery");
    runDiscoverySearch();
}

function renderDiscoveryResults(buyers) {
    const tbody = document.getElementById("disc-results-tbody");
    if (!tbody) return;

    if (!buyers || buyers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No search results returned.</td></tr>`;
        return;
    }

    tbody.innerHTML = buyers.map((b, idx) => `
        <tr>
            <td><input type="checkbox" class="disc-checkbox" data-idx="${idx}" checked></td>
            <td><strong>${escapeHtml(b.company)}</strong></td>
            <td>${escapeHtml(b.name || 'Purchase Manager')}</td>
            <td>${escapeHtml(b.email)}</td>
            <td>${escapeHtml(b.country)}</td>
            <td><span class="badge badge-cyan">${escapeHtml(b.business_type)}</span></td>
            <td><small class="text-muted">${escapeHtml(b.source)}</small></td>
            <td>
                ${b.validation_status ? (
                    b.validation_status === 'valid' ? '<span class="badge badge-green">Valid</span>' :
                    b.validation_status === 'invalid' ? '<span class="badge badge-red">Invalid</span>' :
                    '<span class="badge badge-gold">Duplicate</span>'
                ) : '<span class="badge badge-purple">Extracted</span>'}
            </td>
        </tr>
    `).join("");
}

function toggleSelectAllDisc(masterCb) {
    document.querySelectorAll(".disc-checkbox").forEach(cb => cb.checked = masterCb.checked);
}

// --- STEP 3: VALIDATE & CLEAN DATA ---
async function runValidationOnDiscovered() {
    if (!state.discoveredBuyers || state.discoveredBuyers.length === 0) {
        alert("No discovered buyers available to validate.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/buyers/validate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyers: state.discoveredBuyers })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`Validation Complete!\nValid: ${data.valid_count} | Invalid: ${data.invalid_count} | Duplicates: ${data.duplicate_count} | Manual Review: ${data.manual_review_count}`);
            
            // Merge validated lists
            state.discoveredBuyers = [
                ...data.valid_records,
                ...data.invalid_records,
                ...data.duplicate_records
            ];
            renderDiscoveryResults(state.discoveredBuyers);
        }
    } catch (e) {
        console.error("Validation error:", e);
    }
}

// --- STEP 4: AI LEAD CLASSIFICATION ---
async function runAIClassificationOnDiscovered() {
    if (!state.discoveredBuyers || state.discoveredBuyers.length === 0) {
        alert("No buyers available to classify with AI.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/buyers/classify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyers: state.discoveredBuyers })
        });

        if (res.ok) {
            const data = await res.json();
            state.discoveredBuyers = data.buyers || [];
            renderDiscoveryResults(state.discoveredBuyers);
            alert(`AI Lead Qualification Complete! ${data.total_classified} leads scored and prioritized.`);
        }
    } catch (e) {
        console.error("AI Classification error:", e);
    }
}

// Save Cleaned Buyers into SQLite Database
async function saveSelectedBuyers() {
    const selectedIndexes = Array.from(document.querySelectorAll(".disc-checkbox:checked")).map(cb => parseInt(cb.dataset.idx));
    if (selectedIndexes.length === 0) {
        alert("Please select at least one buyer to save.");
        return;
    }

    const selectedBuyers = selectedIndexes.map(idx => state.discoveredBuyers[idx]).filter(Boolean);

    // Run classification if not yet classified
    const classified = await fetch(`${API_BASE}/buyers/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyers: selectedBuyers })
    }).then(r => r.json()).then(d => d.buyers || selectedBuyers).catch(() => selectedBuyers);

    try {
        const res = await fetch(`${API_BASE}/buyers/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ buyers: classified })
        });

        if (res.ok) {
            const data = await res.json();
            alert(`Saved ${data.saved_count} new clean buyer leads to database!`);
            fetchDashboardMetrics();
            fetchDatabaseBuyers();
        }
    } catch (e) {
        console.error("Save buyers error:", e);
    }
}

// --- STEP 5 & 6: CAMPAIGN CREATOR & LIVE PREVIEW ---
function insertTag(tagStr) {
    const textarea = document.getElementById("camp-body-template");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    textarea.value = text.substring(0, start) + tagStr + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + tagStr.length;
    updateEmailPreview();
}

function updateEmailPreview() {
    const prod = document.getElementById("camp-product").value || "Singing Bowls";
    const category = document.getElementById("camp-category").value || "Wellness";
    const moq = document.getElementById("camp-moq").value || "50 Units";
    const customization = document.getElementById("camp-customization").value || "OEM Available";
    const shipping = document.getElementById("camp-shipping").value || "Air Cargo";

    const senderName = document.getElementById("camp-sender-name").value || "Export Manager";
    const senderCompany = document.getElementById("camp-sender-company").value || "Global Export Ltd";
    const senderEmail = document.getElementById("camp-sender-email").value || "sales@globalexport.com";
    const senderPhone = document.getElementById("camp-sender-phone").value || "+1 800 555 0199";

    const subjectTemplate = document.getElementById("camp-subject").value;
    const bodyTemplate = document.getElementById("camp-body-template").value;

    const compiledSubject = subjectTemplate.replace(/{{product_name}}/g, prod);
    
    let compiledBody = bodyTemplate
        .replace(/{{buyer_name}}/g, "John Smith")
        .replace(/{{company_name}}/g, "ABC Imports LLC")
        .replace(/{{country}}/g, "USA")
        .replace(/{{website}}/g, "https://www.abcimports.com")
        .replace(/{{source}}/g, "Google Search")
        .replace(/{{product_name}}/g, prod)
        .replace(/{{category}}/g, category)
        .replace(/{{export_availability}}/g, "Worldwide Export")
        .replace(/{{customization_options}}/g, customization)
        .replace(/{{min_order_quantity}}/g, moq)
        .replace(/{{shipping_availability}}/g, shipping)
        .replace(/{{sender_name}}/g, senderName)
        .replace(/{{sender_company}}/g, senderCompany)
        .replace(/{{sender_email}}/g, senderEmail)
        .replace(/{{sender_phone}}/g, senderPhone)
        .replace(/{{pitch_snippet}}/g, "We noticed that ABC Imports LLC specializes in importing wellness goods into USA. We believe our Singing Bowls collection will complement your portfolio.");

    document.getElementById("preview-subject").innerText = compiledSubject;
    document.getElementById("preview-body-text").innerText = compiledBody;
}

async function handlePresentationUpload(input) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${API_BASE}/upload-presentation`, {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            state.currentPresentationPath = data.path;
            document.getElementById("pdf-filename-display").innerText = `✓ ${data.filename}`;
            document.getElementById("preview-attachment-name").innerText = data.filename;
            alert("Company presentation PDF uploaded successfully!");
        }
    } catch (e) {
        console.error("PDF upload error:", e);
    }
}

async function saveCampaignConfig() {
    const payload = {
        name: document.getElementById("camp-title").value,
        product: document.getElementById("camp-product").value,
        category: document.getElementById("camp-category").value,
        export_availability: "Worldwide Export",
        customization_options: document.getElementById("camp-customization").value,
        min_order_quantity: document.getElementById("camp-moq").value,
        shipping_availability: document.getElementById("camp-shipping").value,
        sender_name: document.getElementById("camp-sender-name").value,
        sender_company: document.getElementById("camp-sender-company").value,
        sender_email: document.getElementById("camp-sender-email").value,
        sender_phone: document.getElementById("camp-sender-phone").value,
        subject: document.getElementById("camp-subject").value,
        body_template: document.getElementById("camp-body-template").value,
        target_audience: "All Valid",
        sending_limit: parseInt(document.getElementById("camp-limit").value) || 25,
        delay_seconds: parseInt(document.getElementById("camp-delay").value) || 5,
        attachment_path: state.currentPresentationPath
    };

    try {
        const res = await fetch(`${API_BASE}/campaigns`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const camp = await res.json();
            state.activeCampaign = camp;
            alert("Campaign Configuration Saved Successfully!");
        }
    } catch (e) {
        console.error("Save campaign error:", e);
    }
}

// --- STEP 7 & 8: GMAIL OUTREACH DISPATCHER & LOGS ---
function toggleGmailModeInputs() {
    const mode = document.getElementById("gmail-mode-select").value;
    const inputs = document.getElementById("live-gmail-inputs");
    inputs.style.display = mode === "live" ? "block" : "none";
    state.gmailMode = mode;
}

async function saveGmailCredentials() {
    const mode = document.getElementById("gmail-mode-select").value;
    const user = document.getElementById("gmail-user").value;
    const pass = document.getElementById("gmail-pass").value;

    try {
        const res = await fetch(`${API_BASE}/settings/gmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode, username: user, password: pass })
        });

        if (res.ok) {
            const data = await res.json();
            const badge = document.getElementById("gmail-status-text");
            badge.innerText = mode === "live" ? "Gmail: Connected (Live SMTP)" : "Gmail: Connected (Sandbox)";
            alert(`Gmail Settings Updated (${mode.toUpperCase()} MODE)`);
        }
    } catch (e) {
        console.error("Gmail settings error:", e);
    }
}

async function startCampaignExecution() {
    // 1. Ensure campaign exists
    if (!state.activeCampaign) {
        await saveCampaignConfig();
    }

    const campId = state.activeCampaign ? state.activeCampaign.id : 1;

    const progressCard = document.getElementById("progress-card");
    progressCard.style.display = "block";
    progressCard.scrollIntoView({ behavior: "smooth" });

    const btnStart = document.getElementById("btn-start-campaign");
    btnStart.disabled = true;
    btnStart.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> SENDING CAMPAIGN IN PROGRESS...`;

    const logFeed = document.getElementById("live-log-feed");
    logFeed.innerHTML = `<div class="log-line text-cyan">[INIT] Starting Outreach Campaign ID: ${campId}...</div>`;

    try {
        const res = await fetch(`${API_BASE}/campaigns/${campId}/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (res.ok) {
            const result = await res.json();

            // Animate progress bar to 100%
            document.getElementById("progress-bar-fill").style.width = "100%";
            document.getElementById("progress-text-count").innerText = `${result.total_processed} / ${result.total_processed} Processed`;
            document.getElementById("progress-text-percent").innerText = "100%";

            document.getElementById("live-sent-count").innerText = result.sent_count;
            document.getElementById("live-failed-count").innerText = result.failed_count;
            document.getElementById("live-skipped-count").innerText = result.skipped_count;

            result.logs.forEach(log => {
                const line = document.createElement("div");
                line.className = "log-line";
                if (log.status === "sent") {
                    line.innerHTML = `<span class="text-green">[SENT ✓]</span> Email sent to ${escapeHtml(log.company_name)} (${escapeHtml(log.recipient_email)}) | Attachment: ${log.attachment_used}`;
                } else if (log.status === "skipped") {
                    line.innerHTML = `<span class="text-purple">[SKIPPED ⏭]</span> ${escapeHtml(log.recipient_email)} (Previously Contacted - Duplicate Skipped)`;
                } else {
                    line.innerHTML = `<span class="text-red">[FAILED ✕]</span> ${escapeHtml(log.recipient_email)}: ${log.error_message}`;
                }
                logFeed.appendChild(line);
            });

            document.getElementById("progress-status-badge").innerText = "Completed";
            document.getElementById("progress-status-badge").className = "badge badge-green";

            fetchDashboardMetrics();
            fetchCampaignLogs(campId);
        }
    } catch (e) {
        console.error("Campaign dispatch error:", e);
        logFeed.innerHTML += `<div class="log-line text-red">[ERROR] Campaign execution interrupted.</div>`;
    } finally {
        btnStart.disabled = false;
        btnStart.innerHTML = `<i class="fa-solid fa-paper-plane"></i> START OUTREACH CAMPAIGN NOW`;
    }
}

async function fetchCampaignLogs(campId = 1) {
    try {
        const res = await fetch(`${API_BASE}/campaigns/${campId}/logs`);
        if (res.ok) {
            const logs = await res.json();
            renderLogsTable(logs);
        }
    } catch (e) {
        console.error("Fetch logs error:", e);
    }
}

function renderLogsTable(logs) {
    const tbody = document.getElementById("logs-table-tbody");
    if (!tbody) return;

    if (!logs || logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No campaign logs recorded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(l => `
        <tr>
            <td><small>${new Date(l.sent_at).toLocaleString()}</small></td>
            <td><strong>${escapeHtml(l.recipient_email)}</strong></td>
            <td>${escapeHtml(l.company_name)}</td>
            <td>${escapeHtml(l.buyer_name)}</td>
            <td><small class="text-green"><i class="fa-solid fa-paperclip"></i> ${escapeHtml(l.attachment_used)}</small></td>
            <td>
                ${l.status === 'sent' ? '<span class="badge badge-green">Sent</span>' :
                  l.status === 'skipped' ? '<span class="badge badge-purple">Skipped (Duplicate)</span>' :
                  '<span class="badge badge-red">Failed</span>'}
            </td>
            <td><small class="text-muted">${escapeHtml(l.error_message || 'OK')}</small></td>
        </tr>
    `).join("");
}

function exportBuyersCSV() {
    window.open(`${API_BASE}/reports/export-csv`, "_blank");
}

// --- MODAL UTILITIES ---
function inspectAIModal(buyerId) {
    const buyer = state.databaseBuyers.find(b => b.id === buyerId);
    if (!buyer) return;

    const ai = buyer.ai_classification || {};

    const modalBody = document.getElementById("ai-modal-body");
    modalBody.innerHTML = `
        <div class="card glass-card">
            <h4>${escapeHtml(buyer.company)} (${escapeHtml(buyer.country)})</h4>
            <p class="text-muted mb-2">${escapeHtml(buyer.website || 'No website provided')}</p>
            
            <div class="grid-2col gap-2 my-3">
                <div class="stat-box">
                    <span class="stat-lbl">AI Lead Score</span>
                    <h2 class="text-gold">⭐ ${buyer.lead_score}/100</h2>
                </div>
                <div class="stat-box">
                    <span class="stat-lbl">Priority Classification</span>
                    <h2><span class="badge badge-purple">${buyer.lead_priority} Priority</span></h2>
                </div>
            </div>

            <h5 class="text-cyan mt-3 mb-1"><i class="fa-solid fa-brain"></i> AI Reasoning Rationale</h5>
            <p class="email-preview-box mb-3">${escapeHtml(ai.reason || 'Lead demonstrates active international trade intent.')}</p>

            <h5 class="text-purple mt-3 mb-1"><i class="fa-solid fa-pen-nib"></i> Customized Pitch Opening</h5>
            <p class="email-preview-box">${escapeHtml(ai.pitch_snippet || 'Custom pitch snippet prepared for this company.')}</p>
        </div>
    `;

    document.getElementById("ai-modal").classList.add("active");
}

function openSettingsModal() {
    document.getElementById("settings-modal").classList.add("active");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

function saveSettingsModal() {
    const key = document.getElementById("modal-gemini-key").value.trim();
    if (key) {
        fetch(`${API_BASE}/settings/gmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gemini_api_key: key })
        });
    }
    closeModal("settings-modal");
    alert("Settings updated!");
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
