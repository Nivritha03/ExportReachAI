'use client';

const STEPS = [
  { num: '01', title: 'DISCOVER', desc: 'Scan and extract importers, distributors, wholesalers, and retailers for your target export product across Google, LinkedIn, and commercial directories.', icon: '🔍' },
  { num: '02', title: 'VERIFY', desc: 'RFC syntax checking and MX record verification ensure valid deliverable emails with zero duplicates.', icon: '🛡️' },
  { num: '03', title: 'QUALIFY', desc: 'AI scores buyer intent (0-100%) based on business fit, market demand, and historical purchasing patterns.', icon: '⚡' },
  { num: '04', title: 'PERSONALIZE', desc: 'Generates tailored outreach matching the buyer’s specific business category and market context.', icon: '✍️' },
  { num: '05', title: 'REACH', desc: 'Dispatches outreach through secure Gmail OAuth with your company presentation attached, tracking campaign signals in real-time.', icon: '🚀' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-slate-950/60 border-y border-white/5">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Seamless 5-Step Process</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            How ExportReach AI Works.
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-sec)' }}>
            An end-to-end autonomous pipeline designed to turn global buyers into long-term trade partners.
          </p>
        </div>

        {/* Vertical Timeline Stack */}
        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Connecting Glow Line */}
          <div className="absolute left-8 lg:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 opacity-40 pointer-events-none" />

          <div className="space-y-12 relative z-10">
            {STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={step.num}
                  className={`flex flex-col lg:flex-row items-start lg:items-center gap-8 ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Step Card */}
                  <div className="w-full lg:w-[calc(50%-2.5rem)] p-6 sm:p-8 rounded-2xl glass-card border border-white/10 hover:border-blue-500/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl p-2.5 rounded-xl bg-slate-900 border border-white/10">{step.icon}</span>
                      <span className="text-xs font-mono font-bold text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        STEP {step.num}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Timeline Badge Node */}
                  <div className="w-16 h-16 rounded-2xl gradient-blue-violet flex items-center justify-center font-black text-white text-lg shadow-lg flex-shrink-0 z-10">
                    {step.num}
                  </div>

                  {/* Spacer for 2-Column Balance */}
                  <div className="hidden lg:block w-[calc(50%-2.5rem)]" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
