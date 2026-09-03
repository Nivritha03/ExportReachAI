'use client';

const FUNNEL = [
  { stage: 'Potential Buyers Found', count: 247, color: '#3b82f6' },
  { stage: 'RFC & MX Verified', count: 189, color: '#6366f1' },
  { stage: 'AI Lead Qualified', count: 132, color: '#8b5cf6' },
  { stage: 'High Priority Matches', count: 72, color: '#a855f7' },
  { stage: 'Outreach Contacted', count: 43, color: '#10b981' },
];

export default function CampaignAnalytics() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-950/60 border-y border-white/5">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Real-Time Outreach Intelligence</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            From Send to Signal.
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-sec)' }}>
            Track delivery signals, buyer response metrics, and campaign conversion funnels seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          
          {/* Top Metric Cards (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl glass-card border border-white/10">
              <div className="text-xs text-slate-400">Total Outreach Emails</div>
              <div className="text-4xl font-black text-white mt-1">247</div>
              <div className="text-xs text-emerald-400 mt-2 font-semibold">↑ 100% Executed</div>
            </div>
            <div className="p-6 rounded-2xl glass-card border border-white/10">
              <div className="text-xs text-slate-400">Delivered Successfully</div>
              <div className="text-4xl font-black text-blue-400 mt-1">238</div>
              <div className="text-xs text-blue-400 mt-2 font-semibold">96.3% Delivery Rate</div>
            </div>
            <div className="p-6 rounded-2xl glass-card border border-white/10">
              <div className="text-xs text-slate-400">High Priority Responses</div>
              <div className="text-4xl font-black text-emerald-400 mt-1">72</div>
              <div className="text-xs text-emerald-400 mt-2 font-semibold">30.2% Response Signal</div>
            </div>
          </div>

          {/* Buyer Conversion Funnel Bar Stack (lg:col-span-8) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl glass-card border-blue-500/30 glow-border space-y-5">
            <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-2">BUYER CONVERSION FUNNEL</div>
            
            {FUNNEL.map((f) => {
              const pct = Math.round((f.count / 247) * 100);
              return (
                <div key={f.stage} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">{f.stage}</span>
                    <span style={{ color: f.color }}>{f.count} <span className="text-slate-500">({pct}%)</span></span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: f.color }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Automated Outreach Funnel</span>
              <span className="text-emerald-400 font-mono font-bold">96.3% Deliverability</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
