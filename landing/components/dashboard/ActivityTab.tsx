'use client';
import { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  campaign_id: number;
  buyer_id: number;
  recipient_email: string;
  buyer_name: string;
  company_name: string;
  sent_at: string;
  status: string;
  error_message?: string;
  attachment_used?: string;
}

export default function ActivityTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // Keep existing logs on fetch error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // 3-second polling interval for real-time live activity updates
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            REAL-TIME GMAIL DISPATCH LOGS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Live Email Activity</h1>
          <p className="text-xs sm:text-sm text-slate-400">Monitor real-time Gmail outreach events, delivery confirmations, and dispatch logs.</p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all"
        >
          🔄 Refresh Activity
        </button>
      </div>

      {/* Activity List Stream */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading live activity logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm space-y-2">
            <div>No outreach emails logged yet.</div>
            <div className="text-xs text-slate-500">Go to <strong>Discover Buyers</strong> and click <strong>⚡ Send Email</strong> to start dispatching!</div>
          </div>
        ) : (
          logs.map((log) => {
            const isSent = log.status === 'sent';
            const isFail = log.status === 'failed';
            const dateStr = log.sent_at ? new Date(log.sent_at).toLocaleTimeString() : 'Just now';

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-wrap items-center justify-between gap-4 transition-all hover:border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isFail
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isSent ? '✓' : isFail ? '✕' : '⏭'}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{log.buyer_name || 'Purchase Manager'}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-300 font-semibold">{log.company_name}</span>
                      <span className="text-blue-400 font-mono font-bold text-[11px]">&lt;{log.recipient_email}&gt;</span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className={`font-semibold capitalize ${isSent ? 'text-emerald-400' : isFail ? 'text-red-400' : 'text-amber-400'}`}>
                        {isSent ? '● Sent via Gmail API' : isFail ? `● Failed: ${log.error_message}` : '● Skipped'}
                      </span>
                      {log.attachment_used && (
                        <span className="text-slate-500 flex items-center gap-1 font-mono text-[10px]">
                          📎 {log.attachment_used}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/5">
                  {dateStr}
                </span>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
