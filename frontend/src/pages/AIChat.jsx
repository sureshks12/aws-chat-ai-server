import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShieldAlert, 
  Server, 
  Terminal, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AIChat = () => {
  const { awsProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedJson, setExpandedJson] = useState({});

  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if initial prompt was passed from Dashboard or sample prompts
    if (location.state?.initialPrompt) {
      const prompt = location.state.initialPrompt;
      setQuestion(prompt);
      // Automatically send prompt if requested
      handleSendPrompt(prompt);
    }
  }, [location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendPrompt = async (textToSend) => {
    const query = textToSend || question;
    if (!query.trim() || loading) return;

    if (!awsProfile) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: 'user', text: query },
        {
          id: Date.now() + 1,
          sender: 'system',
          isWarning: true,
          text: 'AWS Profile is not configured. Please add your AWS Access Key and Secret Key in AWS Profile settings before querying infrastructure.'
        }
      ]);
      setQuestion('');
      return;
    }

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { question: query });
      const data = res.data;

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        data: data
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        isError: true,
        text: err.response?.data?.message || err.response?.data?.error || 'An error occurred while processing your request.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleJsonExpand = (msgId) => {
    setExpandedJson((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const quickPrompts = [
    "Show all running EC2 instances in Mumbai",
    "List stopped t2.micro servers in Virginia",
    "Find EC2 instances with tag Name web-server",
    "Terminate my EC2 instance"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-900 overflow-hidden relative">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty Chat Starter State */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-brand-500/20">
              <Bot className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-100">AWS Infrastructure AI Chat</h2>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Ask natural language questions to query your EC2 instances. Powered by Gemini AI and AWS SDK v3 with read-only policy enforcement.
              </p>
            </div>

            {/* Prompt Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(prompt)}
                  className="p-3.5 rounded-xl glass-card border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                >
                  <span>"{prompt}"</span>
                  <Sparkles className="w-3.5 h-3.5 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex space-x-3.5 max-w-4xl mx-auto ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender !== 'user' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-600/20">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
              )}

              {/* Message Content Bubble */}
              <div className={`space-y-3 max-w-3xl ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                {/* User Message */}
                {msg.sender === 'user' && (
                  <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-lg shadow-brand-600/20 font-medium">
                    {msg.text}
                  </div>
                )}

                {/* System Warning / Error */}
                {msg.isWarning && (
                  <div className="glass-card p-4 rounded-2xl border border-amber-500/30 text-amber-300 text-xs space-y-2">
                    <div className="flex items-center space-x-2 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Configuration Required</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{msg.text}</p>
                    <button
                      onClick={() => navigate('/aws-profile')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400"
                    >
                      Go to AWS Settings
                    </button>
                  </div>
                )}

                {/* AI Error */}
                {msg.isError && (
                  <div className="glass-card p-4 rounded-2xl border border-red-500/30 text-red-400 text-xs flex items-start space-x-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{msg.text}</span>
                  </div>
                )}

                {/* AI Response Data Payload */}
                {msg.data && (
                  <div className="space-y-3">
                    {/* Read-Only Unsupported Message */}
                    {msg.data.message ? (
                      <div className="glass-card p-4 rounded-2xl border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
                        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-300 text-sm">Operation Blocked</p>
                          <p className="mt-1 text-slate-300 leading-relaxed">{msg.data.message}</p>
                        </div>
                      </div>
                    ) : (
                      /* AWS SDK Response Card */
                      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                        {/* Intent Metadata Header */}
                        {msg.data.intent && (
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-mono text-[10px] uppercase font-bold border border-brand-500/20">
                                {msg.data.intent.service} : {msg.data.intent.operation}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                                Region: {msg.data.intent.region}
                              </span>
                            </div>

                            {msg.data.result && (
                              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {msg.data.result.totalInstances ?? 0} Instances Found
                              </span>
                            )}
                          </div>
                        )}

                        {/* Filter Tags */}
                        {msg.data.intent?.filters && msg.data.intent.filters.length > 0 && (
                          <div className="flex items-center space-x-2 text-[11px]">
                            <Tag className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-400 font-medium">Applied Filters:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.data.intent.filters.map((f, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                                  {f.name}: {Array.isArray(f.values) ? f.values.join(', ') : f.values}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* EC2 Instances List */}
                        {msg.data.result?.instances && msg.data.result.instances.length > 0 ? (
                          <div className="space-y-2.5">
                            {msg.data.result.instances.map((inst, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl glass-card border border-slate-800/80 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Server className="w-4 h-4 text-brand-400" />
                                    <span className="font-bold text-slate-100 font-mono">{inst.instanceId}</span>
                                    {inst.name && (
                                      <span className="text-slate-300 font-medium">({inst.name})</span>
                                    )}
                                  </div>

                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                                      inst.state === 'running'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-slate-700/50 text-slate-400 border-slate-600'
                                    }`}
                                  >
                                    {inst.state}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                                  <div>
                                    <span className="block text-[10px] text-slate-500">Type</span>
                                    <span className="font-mono text-slate-200">{inst.instanceType}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500">Public IP</span>
                                    <span className="font-mono text-slate-200">{inst.publicIpAddress || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="block text-[10px] text-slate-500">Private IP</span>
                                    <span className="font-mono text-slate-200">{inst.privateIpAddress || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No EC2 instances matched the query criteria.</p>
                        )}

                        {/* Collapsible JSON Viewer */}
                        <div className="pt-2 border-t border-slate-800">
                          <button
                            onClick={() => toggleJsonExpand(msg.id)}
                            className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <Terminal className="w-3.5 h-3.5 text-brand-400" />
                            <span>{expandedJson[msg.id] ? 'Hide Raw JSON' : 'View Raw JSON'}</span>
                            {expandedJson[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>

                          {expandedJson[msg.id] && (
                            <pre className="mt-2.5 p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                              {JSON.stringify(msg.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shrink-0 border border-slate-600">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="flex space-x-3 max-w-4xl mx-auto items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-md shadow-brand-600/20">
              <Bot className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <span>Analyzing query with Gemini AI & executing AWS SDK command...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Chat Input Footer */}
      <div className="p-4 border-t border-slate-800 bg-dark-900/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={awsProfile ? "Ask about your AWS infrastructure (e.g. List running EC2 instances in Mumbai)..." : "Configure AWS credentials to start asking questions..."}
              disabled={loading}
              className="w-full pl-4 pr-12 py-3.5 rounded-2xl glass-input text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/50"
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="absolute right-2 p-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl shadow-md disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
