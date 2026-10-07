import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  Briefcase,
  PlayCircle,
  Code,
  TrendingUp,
  LogOut,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    api.logout();
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume', path: '/resume', icon: FileText },
    { label: 'Job Profile', path: '/job', icon: Briefcase },
    { label: 'Match Matrix', path: '/skills', icon: BrainCircuit },
    { label: 'Start Interview', path: '/setup', icon: PlayCircle },
    { label: 'Coding Lab', path: '/coding', icon: Code },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
  ];

  const isDashboard = location.pathname === '/dashboard';

  return (
    <>
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/dashboard" className="flex items-center space-x-3 group shrink-0 mr-6 lg:mr-8">
              {!isDashboard && (
                <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  AI Mock Interview Platform and Multimodal Analysis
                </span>
              </div>
            </Link>

            {/* User profile / Theme Toggle / Logout */}
            <div className="flex items-center space-x-3">
              {/* Dark / Light Theme Toggle beside Profile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 border border-slate-800 transition-all cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>

              <div className="hidden sm:flex items-center space-x-2 text-right">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-200">{user?.full_name || 'Candidate'}</p>
                  <p className="text-slate-500 truncate max-w-[120px]">{user?.email || 'Student'}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Vertical Sidebar fixed on the left side */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 z-40 flex flex-col p-4 overflow-y-auto">
        <nav className="flex flex-col space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
