import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles, Bell, Sun, Moon, Search, GraduationCap, School, Settings, X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser, theme, toggleTheme,
    notifications, markNotificationsRead,
    setSelectedUserProfile, setActiveTab, users, projects
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const isTeacher = currentUser.role === 'teacher';
  const roleLabel = isTeacher ? 'Teacher' : 'Student';

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchedUsers = trimmedQuery
    ? users.filter(
        u =>
          u.name.toLowerCase().includes(trimmedQuery) ||
          u.college.toLowerCase().includes(trimmedQuery) ||
          u.department.toLowerCase().includes(trimmedQuery) ||
          u.skillsToTeach.some(s => s.name.toLowerCase().includes(trimmedQuery))
      ).slice(0, 5)
    : [];
  const matchedProjects = trimmedQuery
    ? projects.filter(
        p =>
          p.title.toLowerCase().includes(trimmedQuery) ||
          p.techStack.some(t => t.toLowerCase().includes(trimmedQuery))
      ).slice(0, 3)
    : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SkillSwap AI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Student Collaboration Platform
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, projects, hackathons, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {trimmedQuery && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 space-y-2 max-h-80 overflow-y-auto">
              {matchedUsers.length === 0 && matchedProjects.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-2">
                  No genuine users or projects matched "{searchQuery}".
                </p>
              ) : (
                <>
                  {matchedUsers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                        Registered Members
                      </span>
                      {matchedUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setSelectedUserProfile(u);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                        >
                          <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{u.college} • {u.department}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {matchedProjects.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                        Projects
                      </span>
                      {matchedProjects.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setActiveTab('projects');
                            setSearchQuery('');
                          }}
                          className="w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors"
                        >
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{p.category} • {p.college}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsRead();
              }}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-3">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</h4>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        n.read
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40 text-slate-600 dark:text-slate-400'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p>{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Quick Access Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Account Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logged-in User Info - Navigates to Profile / Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedUserProfile(currentUser)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500/30 transition-all cursor-pointer"
              title="View your public profile"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {currentUser.name}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                  {isTeacher ? <School className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                  {roleLabel}
                </span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
