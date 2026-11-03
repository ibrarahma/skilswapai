import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { calculateTeamMatchWithAI } from '../../lib/gemini';
import {
  Sparkles, Search, ShieldCheck, GraduationCap,
  Send, CheckCircle2, RefreshCw, Target, X
} from 'lucide-react';

// Issue 1: Maximum of 5 reusable button variants with accessible focus states
export const TEAM_FINDER_BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50',
  outline:
    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
  textLink:
    'inline-flex items-center gap-1 text-left font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded',
  destructive:
    'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500',
} as const;

// Issues 6 & 9: Single consistent display-name formatter (preserves original Firebase data)
export const formatCandidateDisplayName = (rawName?: string): string => {
  if (!rawName) return 'Student Member';
  const trimmed = rawName.trim();
  if (!trimmed) return 'Student Member';

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (word.length <= 1) return word.toUpperCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

export const AITeamFinder: React.FC = () => {
  const { users, currentUser, setSelectedUserProfile, openDirectChat, sendMessage, sendConnectionRequest } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetProjectGoal, setTargetProjectGoal] = useState('Hackathon Team');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('All');
  const [aiAnalyzingUserId, setAiAnalyzingUserId] = useState<string | null>(null);
  const [aiMatchResults, setAiMatchResults] = useState<Record<string, any>>({});
  const [inviteUser, setInviteUser] = useState<UserProfile | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    if (!inviteUser) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInviteUser(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inviteUser]);

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
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Find High-Compatibility Teammates & Co-founders
          </h1>
          <p className="text-xs text-purple-300 mt-1 max-w-2xl leading-relaxed">
            Our AI engine analyzes complementary skill vectors, college availability, and hackathon experience to calculate instant Compatibility Scores.
          </p>
        </div>
      </div>

      {/* Issue 8: Consolidated Search, Campus Filter & Target Collaboration Goal Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3">
          {/* Search Input */}
          <div className="flex-1">
            <label htmlFor="team-candidate-search" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Search Teammates
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" />
              <input
                id="team-candidate-search"
                type="text"
                placeholder="Search candidates by skill, interest, or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Issue 4 & 8: Target Collaboration Goal Dropdown inside Filter Toolbar with >=12px (text-xs) label */}
          <div className="w-full lg:w-72 shrink-0">
            <label
              htmlFor="target-collaboration-goal"
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-300 mb-1.5"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Target Collaboration Goal</span>
            </label>
            <select
              id="target-collaboration-goal"
              value={targetProjectGoal}
              onChange={(e) => setTargetProjectGoal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Hackathon Team">Hackathon Team (48-hr sprint)</option>
              <option value="Startup Co-founder">Startup Co-founder Search</option>
              <option value="Major Degree Project">Major Degree Project</option>
              <option value="Open Source Research">Open Source Research</option>
            </select>
          </div>
        </div>

        {/* Campus Filter Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
            Campus:
          </span>
          {colleges.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCollegeFilter(c)}
              className={
                selectedCollegeFilter === c
                  ? TEAM_FINDER_BUTTON_VARIANTS.primary
                  : TEAM_FINDER_BUTTON_VARIANTS.outline
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Issue 7: Semantic H2 Section Heading before H3 Candidate Headings */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Available Teammates ({candidateList.length})
        </h2>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Goal: {targetProjectGoal}
        </span>
      </div>

      {/* Candidate Cards Grid */}
      {candidateList.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
            No registered teammates found matching your criteria
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Fake/demo accounts have been removed. Only genuine registered students and mentors appear in AI Team Finder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {candidateList.map((candidate) => {
            const aiAnalysis = aiMatchResults[candidate.id];
            const isAnalyzing = aiAnalyzingUserId === candidate.id;
            const score = aiAnalysis?.compatibilityScore || candidate.compatibilityScore || 92;
            const formattedName = formatCandidateDisplayName(candidate.name);
            const topThreeSkills = (candidate.skillsToTeach || []).slice(0, 3);
            const remainingSkillCount = Math.max(0, (candidate.skillsToTeach || []).length - 3);
            const departmentLabel = candidate.department?.trim()
              ? candidate.college?.trim()
                ? `${candidate.department} • ${candidate.college}`
                : candidate.department
              : candidate.college?.trim() || 'Department not specified';
            const availabilityLabel = candidate.availabilityStatus?.trim() || 'Available for Projects';
            const bioText = candidate.bio?.trim() || 'No bio provided yet.';

            return (
              <div
                key={candidate.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
              >
                {/* Main Card Content (flex-1) */}
                <div className="flex-1 flex flex-col space-y-3">
                  {/* Card Header: Avatar, Formatted Name (H3), and Match Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={candidate.avatar}
                        alt={formattedName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate">
                            <button
                              type="button"
                              onClick={() => setSelectedUserProfile(candidate)}
                              className={TEAM_FINDER_BUTTON_VARIANTS.textLink}
                            >
                              <span className="truncate">{formattedName}</span>
                            </button>
                          </h3>
                          {candidate.verificationStatus === 'verified' && (
                            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                        </div>

                        {/* Metadata Item 1: Department */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="truncate">{departmentLabel}</span>
                        </p>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <div className="text-center px-3 py-1.5 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/50 shrink-0">
                      <span className="text-xs font-black text-purple-700 dark:text-purple-300 block">
                        {score}%
                      </span>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Match
                      </span>
                    </div>
                  </div>

                  {/* Metadata Item 2: Top 3 Relevant Skills */}
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                    {topThreeSkills.length > 0 ? (
                      <>
                        {topThreeSkills.map((st) => (
                          <span
                            key={st.id}
                            className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {st.name}
                          </span>
                        ))}
                        {remainingSkillCount > 0 && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300">
                            +{remainingSkillCount} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        Skills not listed yet
                      </span>
                    )}
                  </div>

                  {/* Metadata Item 3: Availability Status (>=12px text-xs with emerald indicator + accessible text) */}
                  <div className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0"
                    />
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Status: {availabilityLabel}
                    </span>
                  </div>

                  {/* Metadata Item 4: Short Bio */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {bioText}
                  </p>
                </div>

                {/* Issue 2: Bottom-pinned Action Section (mt-auto) ensuring horizontal button alignment across cards */}
                <div className="mt-auto pt-4 space-y-3">
                  {/* AI Match Breakdown Box or Run AI Compatibility Analysis Button */}
                  {aiAnalysis ? (
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-300 text-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Compatibility Insight</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                        {aiAnalysis.breakdownSummary}
                      </p>
                      <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                        Suggested Role: {aiAnalysis.recommendedRole}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRunAiMatchAnalysis(candidate)}
                      disabled={isAnalyzing}
                      className={`${TEAM_FINDER_BUTTON_VARIANTS.secondary} w-full`}
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

                  {/* Footer Action Bar */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      ● {availabilityLabel}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setInviteUser(candidate);
                        setInviteMessage(`Hey ${formattedName}! We saw your profile on SkillSwap AI and would love to have you on our team for ${targetProjectGoal}.`);
                      }}
                      className={TEAM_FINDER_BUTTON_VARIANTS.primary}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite To Team</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {inviteUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-team-modal-title"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl space-y-4"
          >
            <button
              type="button"
              onClick={() => setInviteUser(null)}
              aria-label="Close invitation modal"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
            <h2 id="invite-team-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100 pr-8">
              Invite {formatCandidateDisplayName(inviteUser.name)} to Team
            </h2>

            {inviteSuccess ? (
              <div role="status" aria-live="polite" className="py-6 text-center text-emerald-600 dark:text-emerald-400 font-semibold space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400 animate-bounce" aria-hidden="true" />
                <p className="text-xs">Team Invitation Sent!</p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div>
                  <label htmlFor="team-invite-goal" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Target Project / Goal
                  </label>
                  <input
                    id="team-invite-goal"
                    type="text"
                    disabled
                    value={targetProjectGoal}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="team-invite-message" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Personalized Message
                  </label>
                  <textarea
                    id="team-invite-message"
                    rows={3}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInviteUser(null)}
                    className={`${TEAM_FINDER_BUTTON_VARIANTS.outline} flex-1 py-2.5`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${TEAM_FINDER_BUTTON_VARIANTS.primary} flex-1 py-2.5`}
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

