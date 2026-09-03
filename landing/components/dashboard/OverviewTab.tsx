'use client';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export default function OverviewTab({ onNavigateTab }: OverviewTabProps) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl gradient-blue-violet text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-black mb-1">Good afternoon 👋</h1>
          <p className="text-sm text-blue-100">Ready to find your next international buyers?</p>
        </div>
        <button
          onClick={() => onNavigateTab('discover')}
          className="relative z-10 px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-sm hover:scale-105 transition-transform shadow-lg"
        >
          + Launch Buyer Search
        </button>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl glass-card border border-white/10">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>TOTAL BUYERS</span>
            <span className="text-emerald-400 font-bold">↑ 18.4%</span>
          </div>
          <div className="text-3xl font-black text-white">247</div>
          <div className="text-[11px] text-slate-500 mt-2">Discovered across 6 global markets</div>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/10">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>VALID EMAILS</span>
            <span className="text-emerald-400 font-bold">↑ 12.7%</span>
          </div>
          <div className="text-3xl font-black text-blue-400">189</div>
          <div className="text-[11px] text-slate-500 mt-2">RFC & MX server deliverable</div>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/10">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>HIGH PRIORITY</span>
            <span className="text-purple-400 font-bold">↑ 8.3%</span>
          </div>
          <div className="text-3xl font-black text-purple-400">72</div>
          <div className="text-[11px] text-slate-500 mt-2">90%+ AI Intent Match Score</div>
        </div>

        <div className="p-6 rounded-2xl glass-card border border-white/10">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>EMAILS SENT</span>
            <span className="text-emerald-400 font-bold">↑ 21.5%</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">63</div>
          <div className="text-[11px] text-slate-500 mt-2">Dispatched via Gmail OAuth</div>
        </div>
      </div>

      {/* Quick Discovery Widget */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card border border-blue-500/30 glow-border">
        <div className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2">QUICK BUYER DISCOVERY</div>
        <h3 className="text-lg font-bold text-white mb-4">Target Export Intent Search</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Export Product</label>
            <input
              type="text"
              defaultValue="Singing Bowls"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Target Markets</label>
            <input
              type="text"
              defaultValue="USA, UK, Germany, UAE"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Buyer Type</label>
            <input
              type="text"
              defaultValue="Importer, Distributor, Wholesaler"
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
            />
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('discover')}
          className="btn-grad px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <span>FIND BUYERS NOW →</span>
        </button>
      </div>

      {/* Recent Qualified Buyers Table */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Recent Qualified Buyers</h3>
          <button onClick={() => onNavigateTab('leads')} className="text-xs font-semibold text-blue-400 hover:underline">
            View All Leads →
          </button>
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
            <tr>
              <th className="pb-3">Buyer Name</th>
              <th className="pb-3">Company Name</th>
              <th className="pb-3">Country</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">AI Score</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-medium">
            <tr>
              <td className="py-3 font-bold text-white">Sarah Johnson</td>
              <td>Global Wellness Imports</td>
              <td>🇬🇧 UK</td>
              <td><span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">Importer</span></td>
              <td className="font-bold text-emerald-400">94%</td>
              <td><span className="text-emerald-400">✓ Verified</span></td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-white">John Smith</td>
              <td>Zen Imports Ltd.</td>
              <td>🇺🇸 USA</td>
              <td><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Distributor</span></td>
              <td className="font-bold text-emerald-400">91%</td>
              <td><span className="text-emerald-400">✓ Verified</span></td>
            </tr>
            <tr>
              <td className="py-3 font-bold text-white">Hans Mueller</td>
              <td>Zen Wellness GmbH</td>
              <td>🇩🇪 Germany</td>
              <td><span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">Wholesaler</span></td>
              <td className="font-bold text-emerald-400">87%</td>
              <td><span className="text-emerald-400">✓ Verified</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
