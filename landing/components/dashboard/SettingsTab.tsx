'use client';
import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8000';

interface GmailStatus {
  mode: string;
  oauth_connected: boolean;
  smtp_configured: boolean;
  ready: boolean;
  email: string;
}

export default function SettingsTab() {
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [oauthUrl, setOauthUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutFeedback, setSignOutFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Check for oauth=success query param
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'success') {
      window.history.replaceState({}, '', '/dashboard');
    }
    fetchStatus();

    const handleStatusChange = () => fetchStatus();
    window.addEventListener('gmail-status-change', handleStatusChange);
    return () => window.removeEventListener('gmail-status-change', handleStatusChange);
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [statusRes, oauthRes] = await Promise.all([
        fetch(`${API}/api/gmail/status`),
        fetch(`${API}/api/gmail/oauth/url`),
      ]);
      const status = await statusRes.json();
      const oauth = await oauthRes.json();
      setGmailStatus(status);
      setOauthUrl(oauth.auth_url || '');
    } catch {
      setGmailStatus({ mode: 'simulation', oauth_connected: false, smtp_configured: false, ready: true, email: '' });
    } finally {
      setLoading(false);
    }
  };

  const connectGmail = () => {
    if (oauthUrl) {
      window.open(oauthUrl, '_self');
    }
  };

  const signOutGmail = async () => {
    setSigningOut(true);
    setSignOutFeedback(null);
    try {
      const res = await fetch(`${API}/api/gmail/signout`, {
        method: 'POST',
      });
      if (res.ok) {
        setSignOutFeedback('✓ Successfully signed out of Gmail. Switched back to simulation sandbox.');
        await fetchStatus();
        window.dispatchEvent(new Event('gmail-status-change'));
      } else {
        setSignOutFeedback('Failed to sign out. Please try again.');
      }
    } catch (err: any) {
      setSignOutFeedback(`Sign out error: ${err.message}`);
    } finally {
      setSigningOut(false);
      setTimeout(() => setSignOutFeedback(null), 5000);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail.trim()) return;
    setTestSending(true);
    setTestResult(null);
    try {
      // Create a one-off test campaign to this address
      const campRes = await fetch(`${API}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Email – ${new Date().toLocaleTimeString()}`,
          product: 'Singing Bowls',
          sending_limit: 1,
          delay_seconds: 0,
          sender_name: 'ExportReach AI',
          sender_company: 'HandiCraft Exports Ltd',
          sender_email: testEmail.trim(),
          subject: 'Test – ExportReach AI Campaign Email',
          body_template: `Dear Valued Partner,

This is a test email from ExportReach AI to confirm your Gmail connection is working correctly.

If you received this email, your Gmail OAuth is active and campaign dispatch is functional.

Best regards,
ExportReach AI Team`,
        }),
      });
      const camp = await campRes.json();

      // Insert a test buyer targeting the test email
      const buyerRes = await fetch(`${API}/api/buyers/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyers: [{
            name: 'Test Recipient',
            company: 'Your Test Inbox',
            email: testEmail.trim(),
            normalized_email: testEmail.trim().toLowerCase(),
            website: 'https://exportreach.ai',
            country: 'USA',
            business_type: 'Importer',
            source: 'Test',
            source_url: '',
            product: 'Singing Bowls',
            lead_score: 100,
            lead_priority: 'High',
            email_valid: true,
            validation_status: 'verified',
          }]
        }),
      });

      const sendRes = await fetch(`${API}/api/campaigns/${camp.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await sendRes.json();

      const sent = result.sent_count > 0;
      setTestResult({
        success: sent,
        message: sent
          ? `✓ Test email dispatched to ${testEmail} via ${result.mode} mode. Check your inbox!`
          : `Email queued (mode: ${result.mode}). Sent: ${result.sent_count}, Failed: ${result.failed_count}`,
      });
    } catch (err: any) {
      setTestResult({ success: false, message: `Error: ${err.message}` });
    } finally {
      setTestSending(false);
    }
  };

  const isOAuth = gmailStatus?.mode === 'oauth' && gmailStatus?.oauth_connected;
  const isSimulation = gmailStatus?.mode === 'simulation';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Configure Gmail OAuth, test email dispatch, and manage API connections.</p>
      </div>

      {/* Gmail Connection Card */}
      <div className="rounded-2xl glass-card p-6 border border-white/10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-xl">📧</div>
            <div>
              <h2 className="text-base font-bold text-white">Gmail Connection</h2>
              <p className="text-xs text-slate-400">Connect your Gmail account to send campaigns from your own address</p>
            </div>
          </div>
          {!loading && (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isOAuth
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : isSimulation
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-slate-700/40 text-slate-400 border-white/10'
            }`}>
              {isOAuth ? '● OAuth Connected' : isSimulation ? '● Simulation Mode' : '● Not Connected'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="h-20 flex items-center justify-center text-slate-400 text-sm">Checking Gmail status…</div>
        ) : (
          <div className="space-y-4">
            {/* Status panel */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500 mb-1">Current Mode</div>
                <div className="font-bold text-white capitalize">{gmailStatus?.mode}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">OAuth Connected</div>
                <div className={`font-bold ${isOAuth ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isOAuth ? '✓ Yes' : '✗ No'}
                </div>
              </div>
              {gmailStatus?.email && (
                <div className="col-span-2">
                  <div className="text-xs text-slate-500 mb-1">Connected Account</div>
                  <div className="font-bold text-blue-400">{gmailStatus.email}</div>
                </div>
              )}
            </div>

            {/* How it works */}
            {!isOAuth && (
              <div className="p-4 rounded-xl bg-blue-600/5 border border-blue-500/20 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-blue-400 mb-2">How Gmail OAuth works:</div>
                <div className="flex items-start gap-2"><span className="text-blue-400 font-bold mt-0.5">1.</span><span>Click "Connect Gmail" below</span></div>
                <div className="flex items-start gap-2"><span className="text-blue-400 font-bold mt-0.5">2.</span><span>Sign in with your Google account and grant send permission</span></div>
                <div className="flex items-start gap-2"><span className="text-blue-400 font-bold mt-0.5">3.</span><span>You're redirected back here — all campaigns now send from <strong>your Gmail address</strong></span></div>
                <div className="flex items-start gap-2"><span className="text-blue-400 font-bold mt-0.5">4.</span><span>Recipients see your real Gmail as the sender, not a generic address</span></div>
              </div>
            )}

            {/* Connect button */}
            {!isOAuth ? (
              <button
                onClick={connectGmail}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect Gmail with OAuth
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-white">
                        Connected: <span className="text-emerald-400">{gmailStatus?.email || 'Gmail OAuth Account'}</span>
                      </div>
                      <div className="text-xs text-slate-400">All outreach campaigns dispatch directly through your verified Gmail address</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={signOutGmail}
                    disabled={signingOut}
                    className="flex-1 py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/5"
                  >
                    {signingOut ? (
                      <><span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Signing out…</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out of Gmail
                      </>
                    )}
                  </button>
                  <button
                    onClick={connectGmail}
                    className="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-sm font-semibold transition-all bg-slate-800/50 hover:bg-slate-800 cursor-pointer"
                    title="Switch or re-authenticate Google account"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            )}

            {signOutFeedback && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <span>✓</span>
                <span>{signOutFeedback}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Email Dispatch */}
      <div className="rounded-2xl glass-card p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-xl">🧪</div>
          <div>
            <h2 className="text-base font-bold text-white">Send Test Email</h2>
            <p className="text-xs text-slate-400">Verify your Gmail connection by sending a real test email to yourself</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Recipient Email Address</label>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="your@gmail.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={sendTestEmail}
            disabled={testSending || !testEmail.trim()}
            className="w-full py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white transition-all flex items-center justify-center gap-2"
          >
            {testSending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
            ) : (
              '✉️ Send Test Email'
            )}
          </button>

          {testResult && (
            <div className={`p-4 rounded-xl border text-sm font-medium ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {testResult.message}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs text-slate-500">
            <strong className="text-slate-400">Note:</strong> Currently in <strong className="text-amber-400">{gmailStatus?.mode || 'simulation'} mode</strong>.
            {isSimulation && ' Connect Gmail OAuth above to send actual emails from your account.'}
            {isOAuth && ' Emails will be sent directly from your connected Gmail account.'}
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="rounded-2xl glass-card p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-xl">⚙️</div>
          <div>
            <h2 className="text-base font-bold text-white">API Integrations</h2>
            <p className="text-xs text-slate-400">Status of all connected external APIs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'SerpAPI (Buyer Discovery)', status: 'active', desc: 'Google search → real company results' },
            { name: 'Hunter.io (Email Enrichment)', status: 'active', desc: 'Domain search + email verification' },
            { name: 'Gemini AI (Lead Scoring)', status: 'active', desc: 'AI classification + pitch generation' },
            { name: 'Gmail API (Email Dispatch)', status: isOAuth ? 'active' : 'pending', desc: isOAuth ? `Sending from ${gmailStatus?.email || 'your account'}` : 'OAuth connection required' },
          ].map(api => (
            <div key={api.name} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3">
              <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${api.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              <div>
                <div className="text-sm font-semibold text-white">{api.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{api.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
