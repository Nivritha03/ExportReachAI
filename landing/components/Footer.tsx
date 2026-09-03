'use client';

const LINKS = {
  Product: ['Features', 'How It Works', 'Pricing', 'Documentation'],
  Company: ['About', 'Blog', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Cookies'],
};

export default function Footer() {
  return (
    <footer className="py-14" style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-indigo-400">✦</span>
              <span className="font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                ExportReach <span className="gradient-text">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              AI-powered international buyer discovery and export outreach automation.
            </p>
            <div className="flex items-center gap-2">
              <span className="pulse-dot" />
              <span className="text-xs font-medium text-emerald-400">System operational</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--text-muted)' }}>{section}</h4>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors duration-200"
                      style={{ color: 'var(--text-sec)' }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--text-sec)')}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 ExportReach AI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="http://127.0.0.1:8000" target="_blank" rel="noopener noreferrer"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Launch App →
            </a>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
