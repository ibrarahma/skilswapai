import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatDisplayName } from './dashboard/DashboardView';
import {
  Sparkles, Bell, Sun, Moon, Search, GraduationCap, School, Settings, X
} from 'lucide-react';

const NAV_ICON_BUTTON_CLASS =
  'relative p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

export const UNIFIED_SEARCH_INPUT_CLASS =
  'w-full h-10 pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all';

export const Navbar: React.FC = () => {
  const {
    currentUser, theme, toggleTheme,
    notifications, markNotificationsRead,
    setSelectedUserProfile, setActiveTab, users, projects
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNotifications) setShowNotifications(false);
        if (searchQuery) setSearchQuery('');
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          aria-label="SkillSwap AI Pro - Go to Dashboard"
          className="flex items-center gap-3 cursor-pointer text-left rounded-xl p-1 -ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                SkillSwap AI
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 hidden sm:block">
              Student Collaboration Platform
            </p>
          </div>
        </button>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} role="search" aria-label="Sitewide search" className="flex-1 max-w-md hidden md:block relative">
          <label htmlFor="navbar-global-search" className="sr-only">
            Search skills, projects, hackathons, and students
          </label>
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            id="navbar-global-search"
            type="search"
            aria-label="Search skills, projects, hackathons, students"
            placeholder="Search skills, projects, hackathons, students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={UNIFIED_SEARCH_INPUT_CLASS}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear global search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}

          {trimmedQuery && (
            <div
              role="region"
              aria-label="Search results"
              aria-live="polite"
              className="absolute left-0 right-0 mt-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-3 z-50 space-y-2 max-h-80 overflow-y-auto"
            >
              {matchedUsers.length === 0 && matchedProjects.length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-300 text-center py-2">
                  No genuine users or projects matched "{searchQuery}".
                </p>
              ) : (
                <>
                  {matchedUsers.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2">
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
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <img src={u.avatar} alt="" aria-hidden="true" className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{formatDisplayName(u.name)}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{u.college} • {u.department}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {matchedProjects.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2">
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
                          className="w-full p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{p.title}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{p.category} • {p.college}</p>
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
            type="button"
            onClick={toggleTheme}
            className={NAV_ICON_BUTTON_CLASS}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" aria-hidden="true" /> : <Sun className="w-4 h-4" aria-hidden="true" />}
          </button>

          {/* Notifications Center */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsRead();
              }}
              className={NAV_ICON_BUTTON_CLASS}
              aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
              aria-expanded={showNotifications}
              aria-haspopup="dialog"
              title="Notifications"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unreadCount > 0 && (
                <span aria-hidden="true" className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-xs font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                role="dialog"
                aria-label="Notifications panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-3">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notifications</h2>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        n.read
                          ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700/40 text-slate-700 dark:text-slate-300'
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50 text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">{n.title}</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300">{n.time}</span>
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
            type="button"
            onClick={() => setActiveTab('settings')}
            className={NAV_ICON_BUTTON_CLASS}
            aria-label="Account Settings"
            title="Account Settings"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Logged-in User Info - Navigates to Profile / Settings */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedUserProfile(currentUser)}
              aria-label={`View profile for ${formatDisplayName(currentUser.name)} (${roleLabel})`}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-indigo-500/30 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="View your public profile"
            >
              <img
                src={currentUser.avatar}
                alt={formatDisplayName(currentUser.name)}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {formatDisplayName(currentUser.name)}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                  {isTeacher ? <School className="w-3 h-3" aria-hidden="true" /> : <GraduationCap className="w-3 h-3" aria-hidden="true" />}
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
