'use client';
import { useState } from 'react';

export default function CampaignsTab() {
  const [step, setStep] = useState(1);
  const [launched, setLaunched] = useState(false);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">GMAIL OUTREACH AUTOMATION</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Campaigns</h1>
        </div>
        <button onClick={() => { setStep(1); setLaunched(false); }} className="btn-grad px-4 py-2.5 rounded-xl text-xs font-bold">
          + New Campaign Wizard
        </button>
      </div>

      {/* Multi-Step Wizard Card */}
      {!launched ? (
        <div className="p-6 sm:p-8 rounded-2xl glass-card border-blue-500/30 glow-border space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-mono text-blue-400 font-bold">CAMPAIGN BUILDER STEP {step} OF 5</span>
            <span className="text-xs text-slate-400">Targeting: All Qualified Importers</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 1: Select Audience Segment</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/40 text-xs text-white font-bold cursor-pointer">
                  All Qualified Buyers (247)
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 cursor-pointer">
                  High Priority (72)
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 cursor-pointer">
                  Importers Only (54)
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-400 cursor-pointer">
                  UK & USA Markets (136)
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 2: Outreach Template & Variables</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Subject Line</label>
                <input
                  type="text"
                  defaultValue="Export Partnership Opportunity – {{product}}"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 3: Attachment Configuration</h3>
              <div className="p-6 rounded-xl border border-dashed border-white/20 text-center space-y-2">
                <span className="text-3xl">📄</span>
                <div className="text-xs font-bold text-white">Company_Presentation_Catalog.pdf</div>
                <div className="text-[11px] text-emerald-400">✓ Automatically attached to every pitch email</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 4: Gmail Quota & Rate Limits</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-400">Daily Limit:</span> <span className="text-white font-bold">25 emails/day</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
                  <span className="text-slate-400">Sending Delay:</span> <span className="text-white font-bold">60 seconds</span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Step 5: Final Campaign Review</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 text-xs space-y-2">
                <div><span className="text-slate-400">Audience:</span> <span className="text-white font-bold">247 Importers</span></div>
                <div><span className="text-slate-400">Channel:</span> <span className="text-emerald-400 font-bold">Gmail OAuth</span></div>
                <div><span className="text-slate-400">Attachment:</span> <span className="text-white font-bold">Catalog.pdf</span></div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="btn-ghost px-4 py-2 rounded-xl text-xs font-bold">
                ← Back
              </button>
            ) : <div />}

            {step < 5 ? (
              <button onClick={() => setStep(step + 1)} className="btn-grad px-6 py-2.5 rounded-xl text-xs font-bold">
                Next Step →
              </button>
            ) : (
              <button onClick={() => setLaunched(true)} className="btn-grad px-6 py-2.5 rounded-xl text-xs font-bold">
                START CAMPAIGN NOW →
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl glass-card border border-emerald-500/40 text-center space-y-4">
          <div className="text-4xl">🚀</div>
          <h2 className="text-xl font-bold text-white">Campaign Launched Successfully!</h2>
          <p className="text-xs text-slate-400">25 personalized emails queued for dispatch via Gmail OAuth.</p>
          <button onClick={() => setLaunched(false)} className="btn-ghost px-6 py-2.5 rounded-xl text-xs font-bold">
            Create Another Campaign
          </button>
        </div>
      )}

      {/* Active Campaigns Cards List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Active Campaigns</h2>
        <div className="p-5 rounded-xl glass-card border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-white">Singing Bowl UK Outreach</span>
            </div>
            <span className="text-xs text-slate-400">70 Recipients · 43 Sent · 2 Failed</span>
          </div>
          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-xs font-bold text-blue-400">
              <span>Progress</span>
              <span>61%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '61%' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
