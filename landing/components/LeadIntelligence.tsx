'use client';

export default function LeadIntelligence() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-950/40 border-y border-white/5">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Precision Buyer Profiling</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            AI Lead Intelligence & Intent Scoring.
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-sec)' }}>
            Our neural model analyzes company size, import history, category alignment, and decision-maker contact validity.
          </p>
        </div>

        {/* Detailed Lead Card Showcase */}
        <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl glass-card border-blue-500/30 glow-border">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                SJ
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  Sarah Johnson <span className="text-lg">🇬🇧</span>
                </h3>
                <p className="text-sm text-slate-400">Global Wellness Imports · Director of Procurement</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-xs font-bold">
                IMPORTER
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
                DISTRIBUTOR
              </span>
            </div>
          </div>

          {/* AI Match Score Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-center">
            
            {/* Match Circle (md:col-span-4) */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-slate-900/80 border border-white/5 text-center flex flex-col items-center justify-center">
              <div className="text-5xl font-black gradient-text mb-2">94%</div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Match Score</div>
              <div className="text-[11px] text-slate-400 mt-1">High Intent Trade Lead</div>
            </div>

            {/* Score Breakdown (md:col-span-8) */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Business Fit</span>
                  <span className="text-blue-400">96%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '96%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Product Category Match</span>
                  <span className="text-purple-400">92%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Market Potential</span>
                  <span className="text-emerald-400">95%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Contact Deliverability</span>
                  <span className="text-amber-400">94%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>

          </div>

          {/* AI Reasoning Insight Box */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <span className="font-bold text-white block mb-0.5">AI Lead Insight:</span>
              "Strong match because Global Wellness Imports actively distributes handcrafted and wellness items in the UK market with high buyer intent."
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
