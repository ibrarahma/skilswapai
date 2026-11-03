import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  FolderKanban,
  Trophy,
  Sparkles,
  Send,
  Settings,
  School,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    chatChannels,
    swapRequests,
    connectionRequests,
    currentUser,
  } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  // Real pending incoming skill exchange requests + incoming connection requests for the current user
  const incomingPendingSwapsCount = swapRequests.filter(
    (s) => s.receiverId === currentUser.id && s.status === 'pending'
  ).length;
  const incomingPendingConnectionsCount = connectionRequests.filter(
    (c) => c.receiverUid === currentUser.id && c.status === 'Pending'
  ).length;
  const totalSkillsActionBadge = incomingPendingSwapsCount + incomingPendingConnectionsCount;

  const unreadChatCount = chatChannels.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const navItems = [
    {
      id: 'dashboard',
      label: isTeacher ? 'Teacher Dashboard' : 'Student Dashboard',
      icon: isTeacher ? School : LayoutDashboard,
    },
    {
      id: 'skills',
      label: 'Skills Exchange',
      icon: ArrowLeftRight,
      badge: totalSkillsActionBadge > 0 ? totalSkillsActionBadge : undefined,
    },
    { id: 'ai-team', label: 'AI Team Finder', icon: Users, isAi: true },
    { id: 'projects', label: 'Project Hub', icon: FolderKanban },
    { id: 'hackathons', label: 'Hackathons', icon: Trophy },
    { id: 'ai-career', label: 'AI Career Suite', icon: Sparkles, isAi: true },
    {
      id: 'chat',
      label: 'Messages & Chat',
      icon: Send,
      badge: unreadChatCount > 0 ? unreadChatCount : undefined,
    },
    { id: 'settings', label: 'Settings & Account', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside
        aria-label="Main Navigation"
        className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-1 shrink-0 min-h-[calc(100vh-4rem)]"
      >
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Main Navigation
        </div>
        <nav aria-label="Primary sections" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const labelAlreadyContainsAi = /\bAI\b/i.test(item.label);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    aria-hidden="true"
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.isAi ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.isAi && !labelAlreadyContainsAi && !isActive && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    AI
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    aria-label={`${item.badge} pending items`}
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-indigo-700' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Primary Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.badge ? `${item.label} (${item.badge} notifications)` : item.label}
              className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isActive
                  ? 'text-indigo-700 dark:text-indigo-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-xs">{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span aria-hidden="true" className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
