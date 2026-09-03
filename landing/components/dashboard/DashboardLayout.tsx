'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SIDEBAR_ITEMS = [
  { id: 'discover',   label: 'Discover Buyers', icon: '🔍' },
  { id: 'campaigns',  label: 'Campaigns',       icon: '✉️' },
  { id: 'activity',   label: 'Email Activity',  icon: '⚡' },
  { id: 'settings',   label: 'Settings & Gmail', icon: '⚙️' },
];

function GmailStatusPill({ onSettingsClick }: { onSettingsClick: () => void }) {
  const [mode, setMode] = React.useState<string>('simulation');
  const [connected, setConnected] = React.useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/gmail/status')
      .then(r => r.json())
      .then(d => {
        setMode(d.mode || 'simulation');
        setConnected(d.oauth_connected || false);
      })
      .catch(() => {});
  }, []);

  const isOAuth = mode === 'oauth' && connected;

  return (
    <button
      onClick={onSettingsClick}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-300 hover:border-blue-500/30 transition-colors text-left"
    >
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOAuth ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
      <div>
        <span className="font-bold text-white block">Gmail</span>
        <span className="text-[11px] text-slate-400">{isOAuth ? 'OAuth Connected' : 'Simulation Mode'}</span>
      </div>
    </button>
  );
}


export default function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">

      {/* ── MOBILE OVERLAY ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-white/10 mb-6">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileSidebarOpen(false)}>
              <div className="w-9 h-9 rounded-xl gradient-blue-violet flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                ✦
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                ExportReach <span className="gradient-text">AI</span>
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="space-y-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Gmail Status */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <GmailStatusPill onSettingsClick={() => setActiveTab('settings')} />
          <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-2 px-3 py-1">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">

        {/* TOP BAR */}
        <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-3">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl glass flex flex-col items-center justify-center gap-1 flex-shrink-0"
            aria-label="Open menu"
          >
            <span className="w-4 h-0.5 rounded-full bg-slate-300" />
            <span className="w-4 h-0.5 rounded-full bg-slate-300" />
            <span className="w-4 h-0.5 rounded-full bg-slate-300" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <span className="absolute left-3 top-2.5 text-slate-500 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search buyers, companies, campaigns..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setActiveTab('discover')}
              className="btn-grad px-3 sm:px-5 py-2 rounded-xl text-xs font-bold hidden sm:flex items-center gap-1.5"
            >
              + New Search
            </button>
            <div className="w-8 h-8 rounded-full gradient-blue-violet flex items-center justify-center font-bold text-white text-xs border border-white/20">
              EA
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
}
