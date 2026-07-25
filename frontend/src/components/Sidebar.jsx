import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  LayoutDashboard, 
  KeyRound, 
  History, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  Cloud,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, awsProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/chat', name: 'AI AWS Assistant', icon: Bot, badge: 'AI' },
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/aws-profile', name: 'AWS Credentials', icon: KeyRound, alert: !awsProfile },
    { path: '/history', name: 'Chat History', icon: History },
    { path: '/audit', name: 'Audit Logs', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-dark-800/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-1.5">
                  AWS AI Chat
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    POC
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">Infrastructure Assistant</p>
              </div>
            </div>

            <button
              onClick={toggleSidebar}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isOpen && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      {item.badge}
                    </span>
                  )}

                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AWS Profile Alert Card */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {!awsProfile ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-2 text-xs">
              <div className="flex items-center space-x-2 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>AWS Credentials Missing</span>
              </div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Add AWS keys to start querying EC2 infrastructure.
              </p>
              <button
                onClick={() => {
                  navigate('/aws-profile');
                  if (isOpen) toggleSidebar();
                }}
                className="w-full py-1.5 px-3 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-colors flex items-center justify-center gap-1"
              >
                Configure Keys
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                <div>
                  <div className="font-semibold text-slate-200">AWS Configured</div>
                  <div className="text-[10px] text-slate-400">{awsProfile.defaultRegion || 'ap-south-1'}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Active
              </span>
            </div>
          )}

          {/* User Profile / Logout */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-200 border border-slate-600 shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
