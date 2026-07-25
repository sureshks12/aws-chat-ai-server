import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, CheckCircle2, AlertCircle, Trash2, Save, Globe, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const AWSProfile = () => {
  const { awsProfile, refreshProfile } = useAuth();

  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [defaultRegion, setDefaultRegion] = useState('ap-south-1');
  const [showSecret, setShowSecret] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (awsProfile) {
      setAccessKey(awsProfile.accessKey || '');
      setDefaultRegion(awsProfile.defaultRegion || 'ap-south-1');
    }
  }, [awsProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (awsProfile) {
        // PUT update
        const payload = { defaultRegion };
        if (accessKey) payload.accessKey = accessKey;
        if (secretKey) payload.secretKey = secretKey;
        if (sessionToken) payload.sessionToken = sessionToken;

        await api.put('/aws-profile', payload);
        setMessage({ type: 'success', text: 'AWS Credentials updated successfully!' });
      } else {
        // POST create
        await api.post('/aws-profile', {
          accessKey,
          secretKey,
          sessionToken,
          defaultRegion
        });
        setMessage({ type: 'success', text: 'AWS Credentials saved successfully! You can now start querying EC2.' });
      }
      setSecretKey('');
      await refreshProfile();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save AWS credentials.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your AWS Credentials?')) return;

    setLoading(true);
    try {
      await api.delete('/aws-profile');
      setAccessKey('');
      setSecretKey('');
      setSessionToken('');
      setDefaultRegion('ap-south-1');
      setMessage({ type: 'success', text: 'AWS Profile deleted successfully.' });
      await refreshProfile();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete AWS Profile.' });
    } finally {
      setLoading(false);
    }
  };

  const regions = [
    { code: 'ap-south-1', name: 'Mumbai (ap-south-1)' },
    { code: 'us-east-1', name: 'N. Virginia (us-east-1)' },
    { code: 'us-west-2', name: 'Oregon (us-west-2)' },
    { code: 'us-east-2', name: 'Ohio (us-east-2)' },
    { code: 'ap-northeast-1', name: 'Tokyo (ap-northeast-1)' },
    { code: 'eu-west-2', name: 'London (eu-west-2)' },
    { code: 'eu-central-1', name: 'Frankfurt (eu-central-1)' }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AWS Profile & Credentials</h1>
            <p className="text-xs text-slate-400">
              Configure AWS IAM keys. Your secret key is encrypted at rest using AES-256 before storage.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="glass-panel p-6 lg:p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>IAM Security Configuration</span>
          </div>

          {awsProfile && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Profile Configured
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Access Key ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              AWS Access Key ID *
            </label>
            <input
              type="text"
              required
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono tracking-wider"
            />
          </div>

          {/* Secret Access Key */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              AWS Secret Access Key {awsProfile ? '(Leave blank to keep existing)' : '*'}
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                required={!awsProfile}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={awsProfile ? '••••••••••••••••••••••••' : 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'}
                className="w-full pl-4 pr-12 py-3 rounded-xl glass-input text-sm font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Session Token (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              AWS Session Token (Optional)
            </label>
            <input
              type="text"
              value={sessionToken}
              onChange={(e) => setSessionToken(e.target.value)}
              placeholder="FwoGZXIvYXdzEB..."
              className="w-full px-4 py-3 rounded-xl glass-input text-sm font-mono tracking-wider"
            />
          </div>

          {/* Default Region */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              Default Region *
            </label>
            <select
              value={defaultRegion}
              onChange={(e) => setDefaultRegion(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm bg-slate-900 border border-slate-700 text-slate-100"
            >
              {regions.map((r) => (
                <option key={r.code} value={r.code} className="bg-slate-900 text-slate-100">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{awsProfile ? 'Update Credentials' : 'Save Credentials'}</span>
            </button>

            {awsProfile && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl text-sm border border-red-500/20 transition-all flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Credentials</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AWSProfile;
