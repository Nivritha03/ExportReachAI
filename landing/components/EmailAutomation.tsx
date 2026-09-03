'use client';
import { useState } from 'react';

export default function EmailAutomation() {
  const [sent, setSent] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Hyper-Personalized Outreach</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            AI Outreach & Smart Attachments.
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-sec)' }}>
            Dynamic variable injection generates tailored pitch emails with your presentation automatically attached.
          </p>
        </div>

        {/* Side-by-Side Composer UI Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Buyer Profile Column (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="text-xs font-bold uppercase text-slate-400">Target Lead Profile</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                SJ
              </div>
              <div>
                <div className="text-sm font-bold text-white">Sarah Johnson</div>
                <div className="text-xs text-slate-400">sarah@globalwellnessimports.co.uk</div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Company:</span> <span className="text-white font-semibold">Global Wellness Imports</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Country:</span> <span className="text-white font-semibold">🇬🇧 United Kingdom</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Category:</span> <span className="text-blue-400 font-semibold">Handcrafts / Wellness</span></div>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> AI Personalized Subject & Body</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Contact RFC Verified</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Catalog Attached (`Company_Deck.pdf`)</div>
              <div className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Gmail OAuth Secured</div>
            </div>
          </div>

          {/* Email Preview Column (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl glass-card border-blue-500/30 glow-border">
            <div className="text-xs font-mono text-purple-400 mb-2">EMAIL COMPOSER PREVIEW</div>
            
            <div className="space-y-3 mb-6 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 flex items-center gap-2">
                <span className="text-slate-500 w-16">Subject:</span>
                <span className="font-semibold text-white truncate">Export Partnership Opportunity – Singing Bowls</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/60 border border-white/5 space-y-3 leading-relaxed">
                <p>Dear <span className="text-blue-400 font-semibold">Sarah</span>,</p>
                <p>
                  We came across <span className="text-purple-400 font-semibold">Global Wellness Imports</span> while analyzing leading distributors of wellness and handcrafted products in the <span className="text-emerald-400 font-semibold">United Kingdom</span>.
                </p>
                <p>
                  Our authentic Singing Bowls are handcrafted with premium grade bell metal. I have attached our complete product presentation for your review.
                </p>
                <p className="text-slate-400">Best regards,<br /><span className="text-white font-semibold">Export Outreach Team</span></p>
              </div>
            </div>

            {/* Simulated Action Button */}
            <button
              onClick={() => setSent(true)}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                sent ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'btn-grad'
              }`}
            >
              {sent ? (
                <>
                  <span>✓ EMAIL SENT VIA GMAIL</span>
                  <span className="text-xs text-emerald-200">(Delivered to sarah@globalwellnessimports.co.uk)</span>
                </>
              ) : (
                <>
                  <span>SEND EMAIL THROUGH GMAIL →</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
