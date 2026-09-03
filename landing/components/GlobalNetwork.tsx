'use client';
import { useState } from 'react';

const MARKETS = [
  { country: 'United States', code: 'USA', flag: '🇺🇸', buyers: 84, importers: 32, distributors: 28, retailers: 24, avgMatch: '92%' },
  { country: 'United Kingdom', code: 'UK', flag: '🇬🇧', buyers: 52, importers: 22, distributors: 18, retailers: 12, avgMatch: '89%' },
  { country: 'Germany', code: 'DE', flag: '🇩🇪', buyers: 31, importers: 14, distributors: 10, retailers: 7, avgMatch: '91%' },
  { country: 'UAE', code: 'UAE', flag: '🇦🇪', buyers: 27, importers: 12, distributors: 9, retailers: 6, avgMatch: '87%' },
  { country: 'Singapore', code: 'SG', flag: '🇸🇬', buyers: 18, importers: 8, distributors: 6, retailers: 4, avgMatch: '94%' },
  { country: 'Australia', code: 'AU', flag: '🇦🇺', buyers: 15, importers: 6, distributors: 5, retailers: 4, avgMatch: '88%' },
];

export default function GlobalNetwork() {
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);

  return (
    <section className="py-24 relative overflow-hidden border-y border-white/5 bg-slate-950/40">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Global Buyer Network</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Find Buyers Across the World.
          </h2>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-sec)' }}>
            ExportReach AI scans trade databases, verified corporate directories, and global commercial registries in real-time.
          </p>
        </div>

        {/* Global Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Map Representation & Glowing Nodes (lg:col-span-8) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl glass-card relative min-h-[380px] flex flex-col justify-between overflow-hidden">
            {/* Visual SVG Map Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 1000 500" fill="none" stroke="currentColor" className="text-blue-500">
                <circle cx="200" cy="200" r="150" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="500" cy="250" r="220" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="800" cy="200" r="160" strokeWidth="0.5" strokeDasharray="4 4" />
                {/* Connecting trade routes from India hub */}
                <path d="M 580 280 Q 400 180 250 200" stroke="url(#blue-grad)" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M 580 280 Q 520 180 480 160" stroke="url(#blue-grad)" strokeWidth="2" strokeDasharray="6 6" />
                <path d="M 580 280 Q 700 200 780 220" stroke="url(#blue-grad)" strokeWidth="2" strokeDasharray="6 6" />
                <defs>
                  <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Interactive Market Pins Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {MARKETS.map((m) => {
                const isSelected = selectedMarket.code === m.code;
                return (
                  <button
                    key={m.code}
                    onClick={() => setSelectedMarket(m)}
                    className={`p-4 rounded-xl text-left border transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/60 shadow-lg shadow-blue-500/20 scale-105'
                        : 'bg-slate-900/60 border-white/5 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{m.flag}</span>
                      <span className="text-xs font-mono font-bold text-blue-400">{m.buyers} Buyers</span>
                    </div>
                    <div className="text-sm font-bold text-white truncate">{m.country}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Avg Match: <span className="text-emerald-400 font-bold">{m.avgMatch}</span></div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Live Feed Strip */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Market Scanner Active
              </span>
              <span className="font-mono text-blue-400 font-semibold">
                227 Buyers Discovered Across 50+ Global Hubs
              </span>
            </div>
          </div>

          {/* Hover Country Detail Drawer Card (lg:col-span-4) */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-2xl glass-card border-blue-500/30 glow-border">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">{selectedMarket.flag}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedMarket.country}</h3>
                <span className="text-xs text-blue-400 font-mono">Market Code: {selectedMarket.code}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total Verified Buyers</span>
                <span className="text-base font-extrabold text-blue-400">{selectedMarket.buyers}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Active Importers</span>
                <span className="text-sm font-bold text-white">{selectedMarket.importers}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Distributors & Wholesalers</span>
                <span className="text-sm font-bold text-white">{selectedMarket.distributors}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Retailers</span>
                <span className="text-sm font-bold text-white">{selectedMarket.retailers}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">AI Compatibility Score</span>
              <span className="text-base font-black text-emerald-400">{selectedMarket.avgMatch}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
