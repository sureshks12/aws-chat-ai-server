import React from 'react';
import { Menu, ShieldCheck, Sparkles, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ toggleSidebar, title = 'AWS AI Chat Assistant' }) => {
  const { awsProfile } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-dark-900/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          {title}
        </h2>
      </div>

      <div className="flex items-center space-x-3 text-xs">
        {/* Read-Only Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-[11px]">Read-Only Mode</span>
        </div>

        {/* Gemini Engine Badge */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="font-semibold text-[11px]">Gemini 1.5 Flash</span>
        </div>

        {/* Region Indicator */}
        {awsProfile && (
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px]">
            <Server className="w-3.5 h-3.5" />
            <span>{awsProfile.defaultRegion || 'ap-south-1'}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
