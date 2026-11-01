import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, ArrowLeftRight, Users, FolderKanban, Trophy,
  FileText, ArrowUpRight, ShieldCheck, CheckCircle, Clock, Star
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser, activeRole, swapRequests, projects, hackathons,
    users, setActiveTab, setSelectedUserProfile
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
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Powered Student Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {currentUser.name}! 👋
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            {activeRole === 'student' && 'Ready to learn new skills, find hackathon teammates, and build resume-worthy projects today?'}
            {activeRole === 'mentor' && 'Manage your student mentorship requests, verify skill badges, and review startup pitch decks.'}
            {activeRole === 'recruiter' && 'Scout top student talent, inspect AI resume scores, and send interview invitations.'}
            {activeRole === 'admin' && 'Monitor campus skill analytics, approve student verifications, and moderate community content.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('ai-career')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Launch AI Career Suite</span>
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
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
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {currentUser.skillsToTeach.length + currentUser.skillsToLearn.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Active Skill Swaps</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{myProjects.length + 2}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Projects Built</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Trophy className="w-5 h-5" />
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
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentUser.rating} ★</div>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                <span>Pending Skill Swap Proposals</span>
              </h3>
              <button
                onClick={() => setActiveTab('skills')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View Marketplace</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingSwaps.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                No pending swap proposals right now. Request a skill swap with fellow students!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSwaps.map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={s.senderAvatar} alt={s.senderName} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{s.senderName}</h4>
                        <p className="text-[11px] text-slate-500">
                          Teaches <span className="font-semibold text-indigo-600">{s.teachSkill}</span> for <span className="font-semibold text-purple-600">{s.learnSkill}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setActiveTab('chat')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700 transition-all"
                      >
                        Accept & Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Skills Progress Bars */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Skill Level & Mastery Roadmap</span>
            </h3>

            <div className="space-y-3">
              {currentUser.skillsToTeach.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                  You haven't listed any teaching skills yet. Add your skills in Settings or on your Profile!
                </div>
              ) : (
                currentUser.skillsToTeach.map((s, i) => (
                  <div key={s.id}>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>{s.name} ({s.category})</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{s.level} • {Math.min(100, 80 + i * 5)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, 80 + i * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (1 col): AI Recommended Teammates */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span>AI Recommended Matches</span>
              </h3>
              <button
                onClick={() => setActiveTab('ai-team')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                All Matches
              </button>
            </div>

            {recommendedTeammates.length === 0 ? (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                No other registered students found yet. As genuine classmates register, their profiles will appear here!
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedTeammates.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserProfile(u)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{u.name}</h4>
                          <p className="text-[10px] text-slate-400">{u.college}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {u.compatibilityScore || 90}% Match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {u.skillsToTeach.slice(0, 2).map((st) => (
                        <span key={st.id} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium">
                          {st.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Hackathon Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-900 to-slate-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Live Hackathon
              </span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold">{hackathons[0]?.title}</h4>
            <p className="text-xs text-purple-200/80 line-clamp-2">{hackathons[0]?.description}</p>
            <button
              onClick={() => setActiveTab('hackathons')}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition-all"
            >
              Register & Form Team
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
