import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { calculateTeamMatchWithAI } from '../../lib/gemini';
import {
  Users, Sparkles, Filter, Search, ShieldCheck, GraduationCap,
  ArrowRight, Send, CheckCircle2, RefreshCw, Star
} from 'lucide-react';

export const AITeamFinder: React.FC = () => {
  const { users, currentUser, setSelectedUserProfile, setActiveTab, openDirectChat, sendMessage, sendConnectionRequest } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetProjectGoal, setTargetProjectGoal] = useState('Hackathon Team');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('All');
  const [aiAnalyzingUserId, setAiAnalyzingUserId] = useState<string | null>(null);
  const [aiMatchResults, setAiMatchResults] = useState<Record<string, any>>({});
  const [inviteUser, setInviteUser] = useState<UserProfile | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const dynamicColleges = Array.from(
    new Set(users.filter(u => u.id !== currentUser.id && u.college).map(u => u.college))
  );
  const colleges = ['All', ...dynamicColleges];

  const candidateList = users.filter(u => {
    if (u.id === currentUser.id) return false;
    const matchesCollege = selectedCollegeFilter === 'All' || u.college === selectedCollegeFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.college.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.skillsToTeach.some(s => s.name.toLowerCase().includes(q)) ||
      u.interests.some(i => i.toLowerCase().includes(q));
    return matchesCollege && matchesSearch;
  });

  const handleRunAiMatchAnalysis = async (user: UserProfile) => {
    setAiAnalyzingUserId(user.id);
    const result = await calculateTeamMatchWithAI(
      { goal: targetProjectGoal, userSkills: currentUser.skillsToTeach },
      { candidateSkills: user.skillsToTeach, candidateInterests: user.interests }
    );
    setAiMatchResults(prev => ({ ...prev, [user.id]: result }));
    setAiAnalyzingUserId(null);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUser) return;
    try {
      await sendConnectionRequest(inviteUser).catch(() => {});
      const chatId = await openDirectChat(inviteUser);
      if (chatId && inviteMessage.trim()) {
        await sendMessage(chatId, inviteMessage.trim());
      }
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        setInviteUser(null);
      }, 900);
    } catch {
      setInviteSuccess(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>AI Team Matchmaker</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Find High-Compatibility Teammates & Co-founders
          </h1>
          <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
            Our AI engine analyzes complementary skill vectors, college availability, and hackathon experience to calculate instant Compatibility Scores.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs space-y-1 shrink-0 w-full sm:w-auto">
          <span className="text-[10px] uppercase font-bold text-purple-300 block">Target Collaboration Goal</span>
          <select
            value={targetProjectGoal}
            onChange={(e) => setTargetProjectGoal(e.target.value)}
            className="w-full bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-semibold outline-none"
          >
            <option value="Hackathon Team">Hackathon Team (48-hr sprint)</option>
            <option value="Startup Co-founder">Startup Co-founder Search</option>
            <option value="Major Degree Project">Major Degree Project</option>
            <option value="Open Source Research">Open Source Research</option>
          </select>
        </div>
      </div>

      {/* Search & College Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by skill, interest, or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {colleges.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCollegeFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCollegeFilter === c
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {candidateList.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No registered teammates found matching your criteria
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Fake/demo accounts have been removed. Only genuine registered students and mentors appear in AI Team Finder.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {candidateList.map((candidate) => {
          const aiAnalysis = aiMatchResults[candidate.id];
          const isAnalyzing = aiAnalyzingUserId === candidate.id;
          const score = aiAnalysis?.compatibilityScore || candidate.compatibilityScore || 92;

          return (
            <div
              key={candidate.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3
                          onClick={() => setSelectedUserProfile(candidate)}
                          className="font-bold text-sm text-slate-800 dark:text-slate-100 hover:text-indigo-600 cursor-pointer"
                        >
                          {candidate.name}
                        </h3>
                        {candidate.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-4 h-4 text-indigo-500" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{candidate.college} • {candidate.department}</span>
                      </p>
                    </div>
                  </div>

                  {/* Score Pill */}
                  <div className="text-center p-2 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/50">
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 block">
                      {score}%
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Match Score</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {candidate.bio}
                </p>

                {/* AI Match Breakdown Box */}
                {aiAnalysis ? (
                  <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Compatibility Insight</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {aiAnalysis.breakdownSummary}
                    </p>
                    <div className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                      Suggested Role: {aiAnalysis.recommendedRole}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRunAiMatchAnalysis(candidate)}
                    disabled={isAnalyzing}
                    className="w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-900/40 flex items-center justify-center gap-2 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Evaluating AI Synergy...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run AI Compatibility Analysis</span>
                      </>
                    )}
                  </button>
                )}

                {/* Candidate Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skillsToTeach.map(st => (
                    <span key={st.id} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {st.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ● {candidate.availabilityStatus}
                </span>

                <button
                  onClick={() => {
                    setInviteUser(candidate);
                    setInviteMessage(`Hey ${candidate.name}! We saw your profile on SkillSwap AI and would love to have you on our team for ${targetProjectGoal}.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invite To Team</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Invite Modal */}
      {inviteUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Invite {inviteUser.name} to Team
            </h3>

            {inviteSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-semibold space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 animate-bounce" />
                <p>Team Invitation Sent!</p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Project / Goal</label>
                  <input
                    type="text"
                    disabled
                    value={targetProjectGoal}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personalized Message</label>
                  <textarea
                    rows={3}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteUser(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow-md"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
