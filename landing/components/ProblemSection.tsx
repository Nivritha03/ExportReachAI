'use client';

const FRICTION_POINTS = [
  { icon: '🔍', title: 'SEARCH', text: 'Hours spent manually searching for importers on Google & LinkedIn.' },
  { icon: '🛡️', title: 'VERIFY', text: 'Manually verifying bounce-prone contact info & broken company emails.' },
  { icon: '✉️', title: 'PERSONALIZE', text: 'Drafting repetitive outreach emails for hundreds of prospective buyers.' },
  { icon: '📊', title: 'TRACK', text: 'Managing confusing spreadsheets, lost threads, and manual follow-ups.' },
];

export default function ProblemSection() {
  return (
    <section id="solutions" className="py-24 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Traditional Research Bottleneck</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Export Research Wasn't Built For Speed.
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-sec)' }}>
            Manual prospecting wastes days and results in low response rates. ExportReach AI consolidates everything into one intelligent pipeline.
          </p>
        </div>

        {/* 4 Friction Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FRICTION_POINTS.map((item, idx) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl glass-card relative group hover:-translate-y-1 transition-all"
            >
              <div className="text-3xl mb-4 p-3 rounded-xl bg-slate-900/60 w-fit border border-white/5">{item.icon}</div>
              <div className="text-xs font-mono font-bold text-red-400 mb-2">FRICTION 0{idx + 1}</div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Transformation Banner into ONE INTELLIGENT WORKFLOW */}
        <div className="w-full p-8 sm:p-12 rounded-3xl gradient-blue-violet text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">THE EXPORTREACH AI ADVANTAGE</div>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
              One Intelligent Workflow. Zero Manual Work.
            </h3>
            <p className="text-base sm:text-lg text-blue-100 leading-relaxed mb-8">
              From discovering buyers to scoring intent and delivering personalized Gmail outreach with your catalog attached — fully automated.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-sm font-bold">
              <span>✦ Unified Trade Automation Engine</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
