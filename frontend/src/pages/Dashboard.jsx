import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  KeyRound, 
  History, 
  ShieldCheck, 
  Server, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Dashboard = () => {
  const { user, awsProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ historyCount: 0, auditCount: 0, loading: true });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [histRes, auditRes] = await Promise.all([
        api.get('/history').catch(() => ({ data: { count: 0 } })),
        api.get('/audit').catch(() => ({ data: { count: 0 } }))
      ]);
      setStats({
        historyCount: histRes.data.count || 0,
        auditCount: auditRes.data.count || 0,
        loading: false
      });
    } catch (err) {
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const sampleQueries = [
    'Show all running EC2 instances in Mumbai',
    'List all stopped t2.micro servers in Virginia',
    'Get EC2 instances with tag Name web-server in Oregon',
    'Terminate my production EC2 instance'
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 p-8 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-md border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Infrastructure Query Assistant</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Interact with your AWS infrastructure using conversational Gemini AI. Query EC2 instances, filter by tags, states, and regions securely with built-in read-only guardrails.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"
            >
              <Bot className="w-4 h-4 text-brand-600" />
              Start New Chat
            </button>
            <button
              onClick={() => navigate('/aws-profile')}
              className="px-5 py-2.5 bg-black/20 text-white font-semibold rounded-xl text-xs hover:bg-black/30 transition-all border border-white/20 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Manage AWS Keys
            </button>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: AWS Status */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AWS Credentials</span>
            <div className={`p-2 rounded-xl ${awsProfile ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">
              {awsProfile ? 'Connected' : 'Not Configured'}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {awsProfile ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Region: <span className="text-slate-200 font-mono">{awsProfile.defaultRegion}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Action Required
                </>
              )}
            </p>
          </div>
        </div>

        {/* Card 2: AI Engine */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Engine</span>
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">Gemini 1.5 Flash</div>
            <p className="text-xs text-slate-400 mt-1">Structured JSON Intent Extraction</p>
          </div>
        </div>

        {/* Card 3: Chat Queries */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total History</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.historyCount} Queries</div>
            <p className="text-xs text-slate-400 mt-1">Saved in database</p>
          </div>
        </div>

        {/* Card 4: Audit Log entries */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Trail</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.auditCount} Logs</div>
            <p className="text-xs text-slate-400 mt-1">Read-only compliance tracked</p>
          </div>
        </div>
      </div>

      {/* Recommended Test Queries */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Sample Queries to Try
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleQueries.map((query, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/chat', { state: { initialPrompt: query } })}
              className="p-4 rounded-xl glass-card hover:border-brand-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <span className="text-xs text-slate-300 font-medium group-hover:text-white">"{query}"</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
