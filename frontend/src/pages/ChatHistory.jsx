import React, { useState, useEffect } from 'react';
import { History, Trash2, Search, Calendar, ChevronDown, ChevronRight, Terminal, Bot } from 'lucide-react';
import api from '../services/api';

export const ChatHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history?')) return;

    try {
      await api.delete('/history');
      setHistory([]);
    } catch (err) {
      alert('Failed to clear history');
    }
  };

  const filteredHistory = history.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Chat History</h1>
            <p className="text-xs text-slate-400">View and manage your previous AWS AI queries</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl text-xs border border-red-500/20 transition-all flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      {history.length > 0 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved queries..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
      )}

      {/* History List */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Bot className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No Chat History Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'No queries match your search string.' : 'Your query history will appear here once you start chatting with the AWS assistant.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-brand-400">Question:</span>
                  <h3 className="text-sm font-bold text-slate-100">"{item.question}"</h3>
                </div>

                <span className="text-[11px] text-slate-400 flex items-center space-x-1.5 shrink-0 bg-slate-800/80 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </span>
              </div>

              {/* Response Summary JSON toggle */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-brand-400" />
                  <span>{expandedId === item.id ? 'Hide Stored Response' : 'View Stored Response'}</span>
                  {expandedId === item.id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>

                {expandedId === item.id && (
                  <pre className="mt-2.5 p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                    {JSON.stringify(item.response, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
