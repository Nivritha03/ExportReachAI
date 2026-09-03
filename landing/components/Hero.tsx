'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
        
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">
            Next-Gen Autonomous Export Sales Engine
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.15] mb-6 max-w-4xl"
        >
          Discover Verified Global Buyers &{' '}
          <span className="gradient-text-blue">Automate Export Sales</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
        >
          AI-driven intelligence that scans trade registries, validates deliverable contact points, scores buyer intent, and sends high-converting personalized pitches.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16"
        >
          <Link
            href="/dashboard"
            className="btn-primary-glow px-8 py-4 rounded-full text-base font-bold text-white flex items-center justify-center gap-3 w-full sm:w-auto"
          >
            <span>Start Finding Buyers Now</span>
            <span className="text-lg">→</span>
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full text-base font-semibold text-slate-300 bg-slate-900/60 border border-white/10 hover:bg-slate-800 hover:text-white transition-all w-full sm:w-auto"
          >
            See Live Demo
          </a>
        </motion.div>

        {/* Interactive Feature Cards Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        >
          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Global Trade Scan</h3>
            <p className="text-sm text-slate-400">
              Scans live databases across 50+ countries for verified importers, distributors & wholesalers.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. AI Intent Scoring</h3>
            <p className="text-sm text-slate-400">
              Evaluates buyer match probability (up to 98% accuracy) based on product category & trade history.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ✉️
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Gmail Automation</h3>
            <p className="text-sm text-slate-400">
              Sends personalized, hyper-targeted emails with automated product catalog attachments via Gmail OAuth.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
