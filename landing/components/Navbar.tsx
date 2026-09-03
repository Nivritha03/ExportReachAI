'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 glass-panel border-b border-white/10 shadow-2xl' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            ✦
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            ExportReach <span className="gradient-text-blue">AI</span>
          </span>
        </Link>

        {/* Center Nav Items */}
        <nav className="hidden md:flex items-center gap-8 bg-slate-900/60 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
          {['Product', 'How It Works', 'Features', 'Analytics'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-sm font-medium text-slate-300 hover:text-blue-400 transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="btn-primary-glow px-6 py-2.5 rounded-full text-sm font-bold text-white flex items-center gap-2"
          >
            <span>Launch Dashboard</span>
            <span className="text-xs">→</span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
