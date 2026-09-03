'use client';

const ANALYTICS_CARDS = [
  { label: 'Total Buyer Leads', val: '247', change: '↑ 18.4%' },
  { label: 'Outreach Delivered', val: '238', change: '96.3% Rate' },
  { label: 'High Intent Qualified', val: '72', change: '30.2% Funnel' },
  { label: 'Gmail Quota Used', val: '63/500', change: '12.6% Daily' },
];

export default function AnalyticsTab() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">MEASURABLE TRADE METRICS</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Analytics Center</h1>
        <p className="text-xs sm:text-sm text-slate-400">Comprehensive overview of lead discovery, campaign performance, and buyer distribution.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ANALYTICS_CARDS.map((c) => (
          <div key={c.label} className="p-6 rounded-2xl glass-card border border-white/10">
            <div className="text-xs text-slate-400">{c.label}</div>
            <div className="text-3xl font-black text-white mt-1">{c.val}</div>
            <div className="text-xs text-emerald-400 mt-2 font-semibold">{c.change}</div>
          </div>
        ))}
      </div>

      {/* Analytics Breakdown Visual Placeholder */}
      <div className="p-8 rounded-2xl glass-card border border-blue-500/30 glow-border text-center space-y-4">
        <div className="text-xs font-mono text-blue-400 font-bold uppercase">CAMPAIGN DISCOVERY TRENDS & COUNTRY BREAKDOWN</div>
        <div className="h-48 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-400 text-xs font-mono">
          [ Interactive Trend Charts & Recharts Visualization Active ]
        </div>
      </div>

    </div>
  );
}
