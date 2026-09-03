'use client';
import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 10000, suffix: '+', label: 'Buyers Discovered', icon: '👥' },
  { value: 94, suffix: '%', label: 'AI Match Accuracy', icon: '🎯' },
  { value: 50, suffix: '+', label: 'Global Markets', icon: '🌍' },
  { value: 24, suffix: '/7', label: 'Automated Discovery', icon: '⚡' },
];

function Stat({ value, suffix, label, icon, delay = 0 }: typeof STATS[0] & { delay?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        setTimeout(() => {
          const start = performance.now();
          const dur = 1600;
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setN(Math.floor(ease * value));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }, delay);
      }
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, delay]);

  const display = value >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n}`;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 py-4 px-6">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-4xl md:text-5xl font-extrabold gradient-text">{display}{suffix}</div>
      <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="py-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs font-semibold tracking-widest uppercase mb-10" style={{ color: 'var(--text-muted)' }}>
          Built for businesses ready to go global
        </p>
        <div className="glass glow-border rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
            style={{ '--tw-divide-color': 'var(--border)' } as React.CSSProperties}>
            {STATS.map((s, i) => <Stat key={s.label} {...s} delay={i * 100} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
