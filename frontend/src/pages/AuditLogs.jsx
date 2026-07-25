import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Server, Terminal, ChevronDown, ChevronRight } from 'lucide-react';
import api from '../services/api';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/audit');
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Security Audit Logs</h1>
          <p className="text-xs text-slate-400">Complete audit trail of all AWS operations and policy checks</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Server className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Audit Logs Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Audit logs are recorded automatically whenever you submit queries to the AWS Chat Assistant.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Service</th>
                  <th className="px-5 py-4">Operation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono uppercase text-brand-400 font-bold">
                        {log.service}
                      </td>

                      <td className="px-5 py-4 font-mono font-medium text-slate-200">
                        {log.operation}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase border ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : log.status?.includes('REJECTED')
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border-red-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="flex items-center space-x-1 font-medium text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          <Terminal className="w-3.5 h-3.5 text-brand-400" />
                          <span>Payload</span>
                          {expandedId === log.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable JSON details row */}
                    {expandedId === log.id && (
                      <tr className="bg-slate-950/60">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Extracted Request JSON
                              </span>
                              <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                                {JSON.stringify(log.requestJson, null, 2)}
                              </pre>
                            </div>

                            <div>
                              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Response Summary
                              </span>
                              <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                                {JSON.stringify(log.responseSummary, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
