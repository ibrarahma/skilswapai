import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, ArrowLeftRight, Users, FolderKanban, Trophy,
  ChevronRight, Clock, Star
} from 'lucide-react';

export const formatDisplayName = (rawName?: string): string => {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  if (!trimmed) return '';
  return trimmed
    .split(/\s+/)
    .map((word) => {
      const clean = word.replace(/\./g, '');
      if (/^md$/i.test(clean)) {
        return word.toUpperCase();
      }
      if (word === word.toUpperCase() || word === word.toLowerCase()) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ');
};

const DASHBOARD_BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  secondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 text-xs font-bold shadow-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700',
  outline:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md text-white text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700',
  textLink:
    'inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline shrink-0 whitespace-nowrap transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
  destructive:
    'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
} as const;

export const DashboardView: React.FC = () => {
  const {
    currentUser, activeRole, swapRequests, acceptSwapRequest, rejectSwapRequest,
    projects, hackathons, users, setActiveTab, setSelectedUserProfile, openDirectChat
  } = useApp();

  const pendingSwaps = swapRequests.filter(s => s.receiverId === currentUser.id && s.status === 'pending');
  const myProjects = projects.filter(p => p.authorId === currentUser.id);
  const recommendedTeammates = users.filter(u => u.id !== currentUser.id).slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span>AI-Powered Student Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {formatDisplayName(currentUser.name)}! 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            {activeRole === 'student' && 'Ready to learn new skills, find hackathon teammates, and build resume-worthy projects today?'}
            {activeRole === 'mentor' && 'Manage your student mentorship requests, verify skill badges, and review startup pitch decks.'}
            {activeRole === 'recruiter' && 'Scout top student talent, inspect AI resume scores, and send interview invitations.'}
            {activeRole === 'admin' && 'Monitor campus skill analytics, approve student verifications, and moderate community content.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('ai-career')}
              className={DASHBOARD_BUTTON_VARIANTS.secondary}
            >
              <Sparkles className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span>Launch AI Career Suite</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={DASHBOARD_BUTTON_VARIANTS.outline}
            >
              <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              <span>Explore Skill Swap</span>
            </button>
          </div>
        </div>

        {/* Decorative Graphic Background */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <ArrowLeftRight className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {currentUser.skillsToTeach.length + currentUser.skillsToLearn.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Listed Skills</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <FolderKanban className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{myProjects.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Projects Published</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {hackathons.filter(h => h.isRegistered).length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Hackathons Joined</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Star className="w-5 h-5" strokeWidth={2} fill="none" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5">
              <span>{currentUser.rating}</span>
              <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} fill="none" aria-hidden="true" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Peer Trust Score</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Swaps & AI Teammate Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Skill Swap Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 min-w-0">
                <ArrowLeftRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                <span className="truncate">Pending Skill Swap Proposals ({pendingSwaps.length})</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={DASHBOARD_BUTTON_VARIANTS.textLink}
              >
                <span>View Marketplace</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>
            </div>

            {pendingSwaps.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                No pending swap proposals right now. Request a skill swap with fellow students!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSwaps.map((s) => {
                  const senderProfile = users.find(u => u.id === s.senderId);
                  return (
                    <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={s.senderAvatar}
                          alt={formatDisplayName(s.senderName)}
                          className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {formatDisplayName(s.senderName)}
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            Teaches <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s.teachSkill}</span> for <span className="font-semibold text-purple-600 dark:text-purple-400">{s.learnSkill}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            await acceptSwapRequest(s.id);
                            if (senderProfile) {
                              await openDirectChat(senderProfile);
                            } else {
                              setActiveTab('chat');
                            }
                          }}
                          className={DASHBOARD_BUTTON_VARIANTS.primary}
                        >
                          Accept & Chat
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectSwapRequest(s.id)}
                          className={DASHBOARD_BUTTON_VARIANTS.destructive}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Skills Progress Bars */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
              <span>Skill Level & Mastery Roadmap</span>
            </h2>

            <div className="space-y-3">
              {currentUser.skillsToTeach.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                  You haven't listed any teaching skills yet. Add your skills in Settings or on your Profile!
                </div>
              ) : (
                currentUser.skillsToTeach.map((s, i) => {
                  const pct = Math.min(100, 80 + i * 5);
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        <span>{s.name} ({s.category})</span>
                        <span className="text-indigo-700 dark:text-indigo-300">{s.level} • {pct}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${s.name} mastery progress`}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
                      >
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): AI Recommended Teammates */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
                <span className="truncate">AI Recommended Matches</span>
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('ai-team')}
                className={DASHBOARD_BUTTON_VARIANTS.textLink}
              >
                <span>All Matches</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>
            </div>

            {recommendedTeammates.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-600 dark:text-slate-300">
                No other registered students found yet. As genuine classmates register, their profiles will appear here!
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedTeammates.map((u) => (
                  <div
                    key={u.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View profile of ${formatDisplayName(u.name)}, ${u.compatibilityScore || 90}% match`}
                    onClick={() => setSelectedUserProfile(u)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedUserProfile(u);
                      }
                    }}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all space-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={u.avatar}
                        alt={formatDisplayName(u.name)}
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug break-words">
                          {formatDisplayName(u.name)}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug break-words">
                          {u.college}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/50 flex-wrap">
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 shrink-0">
                        {u.compatibilityScore || 90}% Match
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {u.skillsToTeach.slice(0, 2).map((st) => (
                          <span key={st.id} className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-medium">
                            {st.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Hackathon Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 to-slate-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/30">
                Live Hackathon
              </span>
              <Clock className="w-4 h-4 text-purple-300" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-bold">{hackathons[0]?.title}</h3>
            <p className="text-xs text-purple-100/90 line-clamp-2">{hackathons[0]?.description}</p>
            <div className="pt-1 flex">
              <button
                type="button"
                onClick={() => setActiveTab('hackathons')}
                className={DASHBOARD_BUTTON_VARIANTS.primary}
              >
                <span>Register & Form Team</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
