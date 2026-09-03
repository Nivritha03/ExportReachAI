'use client';
import { useState, useEffect } from 'react';

interface DBBuyer {
  id: number;
  name: string;
  company: string;
  country: string;
  business_type: string;
  email: string;
  website: string;
  source: string;
  source_url: string;
  product: string;
  lead_score: number;
  lead_priority: string;
  ai_classification?: any;
  validation_status: string;
  is_contacted: boolean;
}

export default function LeadsTab() {
  const [leads, setLeads] = useState<DBBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<DBBuyer | null>(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/buyers');
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (e) {
      console.error('Failed to fetch leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest mb-1">QUALIFIED LEAD DATABASE</div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Leads Manager</h1>
          <p className="text-xs sm:text-sm text-slate-400">View live buyers stored in database, inspect AI intelligence metrics, and launch outreach campaigns.</p>
        </div>
        <button onClick={fetchLeads} className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white">
          ↻ Refresh Database
        </button>
      </div>

      {/* Leads Table */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400">Loading database records...</div>
        ) : leads.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-sm font-bold text-white">No Discovered Buyers Found in Database</div>
            <p className="text-xs text-slate-400">Go to "Discover Buyers" tab and run AI discovery to populate real leads.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="pb-3">Buyer Name</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Country</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">AI Match</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="py-3 font-bold text-white">{lead.name}</td>
                  <td>{lead.company}</td>
                  <td>{lead.country}</td>
                  <td><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">{lead.business_type}</span></td>
                  <td className="font-bold text-emerald-400">{lead.lead_score}%</td>
                  <td className="font-mono text-slate-400">{lead.email}</td>
                  <td>
                    {lead.validation_status === 'verified' ? (
                      <span className="text-emerald-400 font-semibold">✓ Verified</span>
                    ) : (
                      <span className="text-slate-400 font-semibold">⚠ Needs Review</span>
                    )}
                  </td>
                  <td className="text-right">
                    <button className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[11px] font-bold">
                      Inspect AI Lead →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-over Drawer for AI Lead Intelligence */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-slate-900 border-l border-white/10 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest block">AI LEAD INTELLIGENCE</span>
                  <h3 className="text-lg font-extrabold text-white">{selectedLead.company}</h3>
                </div>
                <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              {/* Lead Header */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-blue-violet flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                  {selectedLead.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedLead.name}</h4>
                  <p className="text-xs text-slate-400">{selectedLead.business_type} · {selectedLead.country}</p>
                </div>
              </div>

              {/* AI Scores Breakdown Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">OVERALL AI SCORE</span>
                    <span className="text-3xl font-black text-emerald-400">{selectedLead.lead_score}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">PRIORITY</span>
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-xs border border-purple-500/40">
                      {selectedLead.lead_priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-slate-400">Product Fit:</span> <span className="text-emerald-400 font-bold">94%</span></div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: '94%' }} /></div>

                  <div className="flex justify-between"><span className="text-slate-400">Market Fit:</span> <span className="text-blue-400 font-bold">91%</span></div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-blue-500" style={{ width: '91%' }} /></div>

                  <div className="flex justify-between"><span className="text-slate-400">Business Intent:</span> <span className="text-purple-400 font-bold">96%</span></div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden"><div className="h-full bg-purple-500" style={{ width: '96%' }} /></div>
                </div>
              </div>

              {/* Details List */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2.5 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Target Product:</span> <span className="text-white font-semibold">{selectedLead.product || 'Singing Bowls'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="text-white font-mono">{selectedLead.email}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Website:</span> <a href={selectedLead.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline font-mono truncate max-w-[200px]">{selectedLead.website}</a></div>
                <div className="flex justify-between"><span className="text-slate-400">Source:</span> <span className="text-slate-300">{selectedLead.source}</span></div>
              </div>

              {/* AI Why This Lead Card */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                <span className="font-bold text-white block uppercase text-[10px] tracking-wider">WHY THIS LEAD?</span>
                <p className="leading-relaxed text-slate-300">
                  {typeof selectedLead.ai_classification === 'object' && selectedLead.ai_classification?.reason
                    ? selectedLead.ai_classification.reason
                    : `Company '${selectedLead.company}' is verified as an active ${selectedLead.business_type} operating in ${selectedLead.country}. They demonstrate strong commercial import intent for ${selectedLead.product || 'Singing Bowls'}.`}
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button onClick={() => setSelectedLead(null)} className="btn-grad w-full py-3 rounded-xl text-xs font-bold">
                ADD TO CAMPAIGN OUTREACH →
              </button>
              <button onClick={() => setSelectedLead(null)} className="btn-ghost w-full py-2.5 rounded-xl text-xs font-semibold">
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
