'use client';
import { motion } from 'framer-motion';

export default function DashboardPreview() {
  return (
    <section id="product" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Enterprise SaaS Experience</h2>
          <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Designed for Modern Exporters
          </p>
        </div>

        {/* Dashboard Mockup Window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-panel-glow rounded-3xl overflow-hidden max-w-5xl mx-auto shadow-2xl"
        >
          {/* Mock Window Top Bar */}
          <div className="px-6 py-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-mono text-slate-400">exportreach.ai/dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gmail Connected</span>
            </div>
          </div>

          {/* Inner Content Preview */}
          <div className="p-6 sm:p-10 bg-slate-950/90 grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="md:col-span-1 glass-panel p-4 rounded-xl space-y-3 hidden md:block">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Navigation</div>
              <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs">📊 Overview</div>
              <div className="p-2.5 rounded-lg text-slate-400 text-xs">🔍 Buyer Discovery</div>
              <div className="p-2.5 rounded-lg text-slate-400 text-xs">👥 Qualified Leads</div>
              <div className="p-2.5 rounded-lg text-slate-400 text-xs">✉️ Email Campaigns</div>
            </div>

            <div className="md:col-span-3 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Total Buyers</div>
                  <div className="text-2xl font-bold text-white mt-1">247</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Verified Emails</div>
                  <div className="text-2xl font-bold text-blue-400 mt-1">189</div>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-400">Match Accuracy</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">94%</div>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl overflow-x-auto">
                <div className="text-xs font-bold text-white mb-3">Live Discovered Leads</div>
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-slate-500 uppercase border-b border-white/10 text-[10px]">
                    <tr>
                      <th className="pb-2">Buyer</th>
                      <th className="pb-2">Company</th>
                      <th className="pb-2">Country</th>
                      <th className="pb-2">AI Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="py-2 font-semibold text-white">Sarah Johnson</td>
                      <td>Global Wellness Imports</td>
                      <td>🇬🇧 UK</td>
                      <td className="text-emerald-400 font-bold">94%</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-semibold text-white">John Smith</td>
                      <td>Zen Imports Ltd.</td>
                      <td>🇺🇸 USA</td>
                      <td className="text-emerald-400 font-bold">91%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
