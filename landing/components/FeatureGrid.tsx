'use client';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: '🔍', title: 'Multi-Channel Buyer Discovery', desc: 'Scan Google, LinkedIn & verified directories for active international importers.' },
  { icon: '⚡', title: 'AI Match & Intent Scoring', desc: 'Rank buyers automatically based on product compatibility and trade volume.' },
  { icon: '🛡️', title: 'RFC Contact Validation', desc: 'Live MX record verification guarantees high inbox delivery rates.' },
  { icon: '✉️', title: 'Gmail Outreach Automation', desc: 'Send personalized pitches directly from your own verified Gmail domain.' },
  { icon: '📎', title: 'Smart PDF Attachments', desc: 'Automatically attach product catalogs and brochures to outreach messages.' },
  { icon: '🔒', title: 'Global Deduplication', desc: 'Prevents sending duplicate messages to the same prospective buyer.' },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Powerful Capabilities</h2>
          <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered For Export Success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-blue-500/40 transition-all hover:-translate-y-1"
            >
              <div className="text-3xl mb-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 w-fit">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="glass-panel-glow p-10 sm:p-16 rounded-3xl text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Ready To Expand Your Export Market?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Discover verified international buyers and start automated outreach in minutes.
          </p>
          <a
            href="/dashboard"
            className="btn-primary-glow inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-bold text-white"
          >
            <span>Launch Dashboard Now</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-10 border-t border-white/10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-bold text-white text-sm">✦ ExportReach AI</div>
        <div>© 2026 ExportReach AI. All rights reserved.</div>
      </div>
    </footer>
  );
}
