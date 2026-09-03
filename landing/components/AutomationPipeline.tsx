'use client';
import { useEffect, useRef, useState } from 'react';

const STAGES = [
  { id: 0, label: 'PRODUCT', icon: '📦', color: '#3b82f6' },
  { id: 1, label: 'AI SEARCH', icon: '🔎', color: '#6366f1' },
  { id: 2, label: 'BUYERS', icon: '👥', color: '#8b5cf6' },
  { id: 3, label: 'VERIFY', icon: '✓', color: '#06b6d4' },
  { id: 4, label: 'AI SCORE', icon: '🧠', color: '#10b981' },
  { id: 5, label: 'PERSONALIZE', icon: '✦', color: '#f97316' },
  { id: 6, label: 'GMAIL', icon: '✉', color: '#ec4899' },
  { id: 7, label: 'TRACK', icon: '📊', color: '#f59e0b' },
];

interface PipelineParticle {
  stageIndex: number;
  progress: number;
  speed: number;
}

export default function AutomationPipeline() {
  const [activeStage, setActiveStage] = useState(-1);
  const [particles, setParticles] = useState<PipelineParticle[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const initialParticles: PipelineParticle[] = [
          { stageIndex: 0, progress: 0, speed: 0.008 },
          { stageIndex: 2, progress: 0, speed: 0.006 },
          { stageIndex: 4, progress: 0, speed: 0.01 },
        ];
        setParticles(initialParticles);

        let frameId: number;
        const animate = () => {
          setParticles((prev) =>
            prev.map((p) => {
              const next = p.progress + p.speed;
              if (next >= 1) {
                const nextStage = (p.stageIndex + 1) % STAGES.length;
                setActiveStage(p.stageIndex);
                return { ...p, stageIndex: nextStage, progress: 0 };
              }
              return { ...p, progress: next };
            })
          );
          frameId = requestAnimationFrame(animate);
        };
        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 w-[400px] h-[400px] bg-orange-600/[0.04] blur-3xl rounded-full -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs tracking-widest uppercase mb-6">
            Automation Pipeline
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            End-to-End Automation.
            <br />
            <span className="gradient-text">From Search to Sent.</span>
          </h2>
        </div>

        {/* Pipeline visualization */}
        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* Desktop: horizontal pipeline */}
          <div className="hidden md:flex items-center justify-between relative">
            {/* Connection line background */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/[0.06] z-0" />

            {/* Animated connection line */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 z-0 transition-all duration-500"
              style={{
                width: `${((activeStage + 1) / STAGES.length) * 100}%`,
                background: `linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)`,
                boxShadow: '0 0 8px rgba(139,92,246,0.5)',
              }}
            />

            {STAGES.map((stage, i) => {
              const isActive = activeStage === i;
              const isPassed = i <= activeStage;
              const hasParticle = particles.some((p) => p.stageIndex === i);

              return (
                <div key={stage.id} className="relative z-10 flex flex-col items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500"
                    style={{
                      background: isPassed
                        ? `linear-gradient(135deg, ${stage.color}33, ${stage.color}15)`
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isPassed ? stage.color + '60' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: isActive
                        ? `0 0 20px ${stage.color}60, 0 0 40px ${stage.color}20`
                        : 'none',
                      transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {stage.icon}
                    {hasParticle && (
                      <div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#030712] animate-ping"
                        style={{ backgroundColor: stage.color }}
                      />
                    )}
                  </div>
                  <div
                    className="text-xs font-semibold tracking-widest transition-colors duration-300"
                    style={{ color: isPassed ? stage.color : '#4b5563' }}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: vertical pipeline */}
          <div className="flex md:hidden flex-col gap-4 relative">
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-white/[0.06]" />
            {STAGES.map((stage, i) => {
              const isPassed = i <= activeStage;
              const isActive = activeStage === i;
              return (
                <div key={stage.id} className="flex items-center gap-4 relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-500"
                    style={{
                      background: isPassed ? `${stage.color}22` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isPassed ? stage.color + '60' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: isActive ? `0 0 20px ${stage.color}60` : 'none',
                    }}
                  >
                    {stage.icon}
                  </div>
                  <div
                    className="text-sm font-semibold transition-colors duration-300"
                    style={{ color: isPassed ? stage.color : '#6b7280' }}
                  >
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
