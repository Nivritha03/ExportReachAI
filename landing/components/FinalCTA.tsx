'use client';

export default function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="section-tag mx-auto w-fit" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.25)' }}>
          Start Today — It's Free
        </div>

        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] mb-5" style={{ color: 'var(--text-primary)' }}>
          Your Next International Buyer
          <br />
          <span className="gradient-text">Is Already Out There.</span>
        </h2>

        <p className="text-lg mb-10" style={{ color: 'var(--text-sec)' }}>
          Let AI find them for you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="http://127.0.0.1:8000"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-grad flex items-center gap-2 font-semibold px-7 py-4 rounded-xl text-base group w-full sm:w-auto justify-center"
          >
            Start Finding Buyers
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </a>
          <a
            href="#features"
            className="btn-ghost flex items-center gap-2 font-semibold px-7 py-4 rounded-xl text-sm w-full sm:w-auto justify-center"
          >
            Explore the Platform →
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 mt-10">
          {['✦ No setup required', '✓ Gmail OAuth secure', '✓ RFC-validated emails', '✦ Duplicate protection'].map(p => (
            <span key={p} className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{p}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
