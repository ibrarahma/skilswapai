import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { formatDisplayName } from '../dashboard/DashboardView';
import { UNIFIED_SEARCH_INPUT_CLASS } from '../Navbar';
import {
  ArrowLeftRight,
  Search,
  Star,
  ShieldCheck,
  GraduationCap,
  School,
  Check,
  X,
  CheckCircle2,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Clock,
  Send,
  BookOpen,
} from 'lucide-react';

export const SKILLS_BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  secondary:
    'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  ghost:
    'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  outline:
    'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  destructive:
    'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
} as const;

export const SkillsExchange: React.FC = () => {
  const {
    users,
    currentUser,
    setSelectedUserProfile,
    swapRequests,
    sendSwapRequest,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest,
    connectionRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    openDirectChat,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'discover' | 'swaps' | 'connections' | 'requests'
  >('discover');

  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Swap modal state
  const [swapTargetUser, setSwapTargetUser] = useState<UserProfile | null>(null);
  const [teachSkillInput, setTeachSkillInput] = useState('');
  const [learnSkillInput, setLearnSkillInput] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);

  useEffect(() => {
    if (!swapTargetUser) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSwapTargetUser(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [swapTargetUser]);

  const categories = [
    'All',
    'Web Dev',
    'AI/ML',
    'Mobile App',
    'Cloud/DevOps',
    'Design/UI',
    'Embedded/IoT',
    'VLSI/Hardware',
    'Career',
  ];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Filter genuine registered users (Students & Teachers)
  const filteredMembers = users.filter((u) => {
    if (u.id === currentUser.id) return false;

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'teacher'
        ? u.role === 'teacher'
        : u.role === 'student';

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.college || '').toLowerCase().includes(q) ||
      (u.institution || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      u.skillsToTeach.some((s) => s.name.toLowerCase().includes(q)) ||
      u.skillsToLearn.some((s) => s.name.toLowerCase().includes(q)) ||
      (u.subjectsAndExpertise || []).some((sub) => sub.toLowerCase().includes(q));

    const matchesCategory =
      selectedCategory === 'All' ||
      u.skillsToTeach.some((s) => s.category === selectedCategory);

    const matchesLevel =
      selectedLevel === 'All' ||
      u.skillsToTeach.some((s) => s.level === selectedLevel);

    return matchesRole && matchesSearch && matchesCategory && matchesLevel;
  });

  // Derived Swap Requests
  const incomingSwapRequests = swapRequests.filter((s) => s.receiverId === currentUser.id);
  const outgoingSwapRequests = swapRequests.filter((s) => s.senderId === currentUser.id);
  const pendingIncomingSwapsCount = incomingSwapRequests.filter(
    (s) => s.status === 'pending'
  ).length;

  // Derived Connections & Connection Requests
  const acceptedConnections = connectionRequests.filter((c) => c.status === 'Accepted');
  const receivedConnectionRequests = connectionRequests.filter(
    (c) => c.receiverUid === currentUser.id && c.status === 'Pending'
  );
  const sentConnectionRequests = connectionRequests.filter(
    (c) => c.senderUid === currentUser.id && c.status === 'Pending'
  );

  const getConnectionWithUser = (targetUid: string) =>
    connectionRequests.find(
      (c) =>
        (c.senderUid === currentUser.id && c.receiverUid === targetUid) ||
        (c.senderUid === targetUid && c.receiverUid === currentUser.id)
    );

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapTargetUser) return;
    await sendSwapRequest(swapTargetUser.id, teachSkillInput, learnSkillInput, swapMessage);
    setSwapSuccess(true);
    setTimeout(() => {
      setSwapSuccess(false);
      setSwapTargetUser(null);
      setSwapMessage('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Student–Teacher Discovery & Skill Exchange</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Connect, Exchange Skills & Collaborate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover verified students and faculty mentors by name, @username, department, or subject expertise.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedUserProfile(currentUser)}
          className={SKILLS_BUTTON_VARIANTS.primary}
        >
          <span>+ Update My Skills & Profile</span>
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubTab('discover')}
          className={
            activeSubTab === 'discover'
              ? SKILLS_BUTTON_VARIANTS.primary
              : SKILLS_BUTTON_VARIANTS.outline
          }
        >
          <Search className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Discover Members ({filteredMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('swaps')}
          className={
            activeSubTab === 'swaps'
              ? SKILLS_BUTTON_VARIANTS.primary
              : SKILLS_BUTTON_VARIANTS.outline
          }
        >
          <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Skill Swap Requests</span>
          {pendingIncomingSwapsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white">
              {pendingIncomingSwapsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('connections')}
          className={
            activeSubTab === 'connections'
              ? SKILLS_BUTTON_VARIANTS.primary
              : SKILLS_BUTTON_VARIANTS.outline
          }
        >
          <Users className="w-3.5 h-3.5" aria-hidden="true" />
          <span>My Connections ({acceptedConnections.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('requests')}
          className={
            activeSubTab === 'requests'
              ? SKILLS_BUTTON_VARIANTS.primary
              : SKILLS_BUTTON_VARIANTS.outline
          }
        >
          <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Connection Requests</span>
          {receivedConnectionRequests.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500 text-white">
              {receivedConnectionRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DISCOVER MEMBERS (STUDENTS & TEACHERS) */}
      {activeSubTab === 'discover' && (
        <>
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Search Skills Exchange members"
                  placeholder="Search by name, @username, institution, department, skills, or subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={UNIFIED_SEARCH_INPUT_CLASS}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear Skills Exchange search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Role Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'student', label: 'Students' },
                  { id: 'teacher', label: 'Teachers / Professors' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleFilter(r.id as any)}
                    className={
                      roleFilter === r.id
                        ? SKILLS_BUTTON_VARIANTS.primary
                        : SKILLS_BUTTON_VARIANTS.outline
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  aria-label="Filter by skill level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-10 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  <option value="All">All Skill Levels</option>
                  {levels.slice(1).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={
                    selectedCategory === cat
                      ? SKILLS_BUTTON_VARIANTS.primary
                      : SKILLS_BUTTON_VARIANTS.outline
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section Heading for Logical H1 -> H2 -> H3 Hierarchy */}
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Verified Students & Faculty Mentors ({filteredMembers.length})
            </h2>
          </div>

          {/* Member Cards Grid */}
          {filteredMembers.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                No matching student or teacher profiles found
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Only genuine registered accounts from Firebase are displayed. Try clearing your filters or invite peers and faculty to join SkillSwap AI!
              </p>
              {(selectedCategory !== 'All' ||
                selectedLevel !== 'All' ||
                roleFilter !== 'all' ||
                searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedLevel('All');
                    setRoleFilter('all');
                    setSearchQuery('');
                  }}
                  className={SKILLS_BUTTON_VARIANTS.primary}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => {
                const isMemberTeacher = member.role === 'teacher';
                const conn = getConnectionWithUser(member.id);
                const displayName = formatDisplayName(member.name);

                return (
                  <div
                    key={member.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group"
                  >
                    <div className="flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <button
                          type="button"
                          onClick={() => setSelectedUserProfile(member)}
                          aria-label={`View profile of ${displayName}`}
                          className="shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <img
                            src={member.avatar}
                            alt={displayName}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 cursor-pointer"
                          />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">
                              <button
                                type="button"
                                onClick={() => setSelectedUserProfile(member)}
                                className="text-left group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                              >
                                {displayName}
                              </button>
                            </h3>
                            {member.verificationStatus === 'verified' && (
                              <ShieldCheck
                                className="w-4 h-4 text-indigo-500 shrink-0"
                                title="Verified Account"
                                aria-label="Verified Account"
                              />
                            )}
                            <span
                              className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold text-xs bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/50 px-2 py-0.5 rounded-lg shrink-0"
                              title="Peer Rating"
                            >
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" aria-hidden="true" />
                              <span>{member.rating || 5.0}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                              @{member.username || member.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isMemberTeacher
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {isMemberTeacher ? (
                                <School className="w-3 h-3" aria-hidden="true" />
                              ) : (
                                <GraduationCap className="w-3 h-3" aria-hidden="true" />
                              )}
                              <span>{isMemberTeacher ? 'Teacher' : 'Student'}</span>
                            </span>
                          </div>

                          <p className="text-[13px] leading-snug text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-1.5 truncate">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
                            <span className="truncate">
                              {member.college || member.institution || 'MANUU, Hyderabad'}
                              {member.department ? ` • ${member.department}` : ''}
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {member.bio || 'Active member on SkillSwap AI.'}
                      </p>

                      {/* Teacher Subjects if Teacher */}
                      {isMemberTeacher &&
                        member.subjectsAndExpertise &&
                        member.subjectsAndExpertise.length > 0 && (
                          <div className="space-y-1.5 mb-3">
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Subjects & expertise</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {member.subjectsAndExpertise.map((sub, i) => (
                                <span
                                  key={i}
                                  className="text-xs font-medium px-2.5 py-0.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Skills to Teach */}
                      <div className="space-y-1.5 mb-3">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                          Can teach / mentor
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {member.skillsToTeach.length === 0 ? (
                            <span className="text-xs text-slate-400 italic">
                              No teaching skills listed yet
                            </span>
                          ) : (
                            member.skillsToTeach.map((st) => (
                              <span
                                key={st.id}
                                className="text-xs font-medium px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                              >
                                {st.name} ({st.level})
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Skills to Learn */}
                      {member.skillsToLearn.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                            Looking to learn
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {member.skillsToLearn.map((sl) => (
                              <span
                                key={sl.id}
                                className="text-xs font-medium px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40"
                              >
                                {sl.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer aligned with margin-top: auto */}
                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedUserProfile(member)}
                        className={SKILLS_BUTTON_VARIANTS.ghost}
                      >
                        <span>View Profile</span>
                      </button>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Connection Action */}
                        {!conn || conn.status === 'Rejected' ? (
                          <button
                            type="button"
                            onClick={() => sendConnectionRequest(member)}
                            className={SKILLS_BUTTON_VARIANTS.secondary}
                          >
                            <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Connect</span>
                          </button>
                        ) : conn.status === 'Pending' && conn.senderUid === currentUser.id ? (
                          <button
                            type="button"
                            onClick={() => cancelConnectionRequest(conn.id)}
                            className={SKILLS_BUTTON_VARIANTS.secondary}
                            title="Cancel sent connection request"
                          >
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Requested</span>
                          </button>
                        ) : conn.status === 'Pending' && conn.receiverUid === currentUser.id ? (
                          <button
                            type="button"
                            onClick={() => acceptConnectionRequest(conn.id)}
                            className={SKILLS_BUTTON_VARIANTS.primary}
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Accept</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDirectChat(member)}
                            className={SKILLS_BUTTON_VARIANTS.secondary}
                          >
                            <Send className="w-3 h-3" aria-hidden="true" />
                            <span>Message</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSwapTargetUser(member);
                            setTeachSkillInput(
                              currentUser.skillsToTeach[0]?.name ||
                                currentUser.subjectsAndExpertise?.[0] ||
                                'Python'
                            );
                            setLearnSkillInput(
                              member.skillsToTeach[0]?.name ||
                                member.subjectsAndExpertise?.[0] ||
                                'Embedded Systems'
                            );
                          }}
                          className={SKILLS_BUTTON_VARIANTS.primary}
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Request Swap</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SKILL SWAP REQUESTS (RECEIVED & SENT) */}
      {activeSubTab === 'swaps' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Received Swap Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Received Skill Swap Requests ({incomingSwapRequests.length})
              </h2>
              {pendingIncomingSwapsCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white">
                  {pendingIncomingSwapsCount} Pending
                </span>
              )}
            </div>

            {incomingSwapRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                No incoming skill swap requests yet.
              </div>
            ) : (
              <div className="space-y-3">
                {incomingSwapRequests.map((swap) => {
                  const senderProfile = users.find((u) => u.id === swap.senderId);
                  const senderDisplayName = formatDisplayName(swap.senderName);
                  return (
                    <div
                      key={swap.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={swap.senderAvatar}
                            alt={senderDisplayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              <button
                                type="button"
                                onClick={() => senderProfile && setSelectedUserProfile(senderProfile)}
                                className="text-left hover:text-indigo-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                              >
                                {senderDisplayName}
                              </button>
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              Offers{' '}
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {swap.teachSkill}
                              </span>{' '}
                              ⇄ Wants{' '}
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {swap.learnSkill}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            swap.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : swap.status === 'declined'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {swap.status}
                        </span>
                      </div>

                      {swap.message && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                          "{swap.message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{swap.createdAt}</span>
                        <div className="flex items-center gap-2">
                          {swap.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => acceptSwapRequest(swap.id)}
                                className={SKILLS_BUTTON_VARIANTS.primary}
                              >
                                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => rejectSwapRequest(swap.id)}
                                className={SKILLS_BUTTON_VARIANTS.destructive}
                              >
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}
                          {senderProfile && (
                            <button
                              type="button"
                              onClick={() => openDirectChat(senderProfile)}
                              className={SKILLS_BUTTON_VARIANTS.secondary}
                            >
                              <Send className="w-3 h-3" aria-hidden="true" />
                              <span>Message</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sent Swap Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Sent Skill Swap Requests ({outgoingSwapRequests.length})
            </h2>

            {outgoingSwapRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                You haven't sent any skill swap requests yet.
              </div>
            ) : (
              <div className="space-y-3">
                {outgoingSwapRequests.map((swap) => (
                  <div
                    key={swap.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        To: {formatDisplayName(swap.receiverName)}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Teach <span className="font-semibold text-indigo-600 dark:text-indigo-400">{swap.teachSkill}</span>{' '}
                        for <span className="font-semibold text-purple-600 dark:text-purple-400">{swap.learnSkill}</span>
                      </p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{swap.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          swap.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : swap.status === 'declined'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {swap.status}
                      </span>
                      {swap.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => cancelSwapRequest(swap.id)}
                          className={SKILLS_BUTTON_VARIANTS.destructive}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY CONNECTIONS */}
      {activeSubTab === 'connections' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                My Connected Network ({acceptedConnections.length})
              </h2>
              <p className="text-xs text-slate-500">
                Students and Teachers/Professors you are connected with. Start a real-time chat anytime.
              </p>
            </div>
          </div>

          {acceptedConnections.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <p className="text-xs text-slate-500">
                You don't have any active connections yet. Discover students and teachers to send a connection request!
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab('discover')}
                className={SKILLS_BUTTON_VARIANTS.primary}
              >
                Explore Directory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedConnections.map((conn) => {
                const isSender = conn.senderUid === currentUser.id;
                const peerUid = isSender ? conn.receiverUid : conn.senderUid;
                const peerUser = users.find((u) => u.id === peerUid);
                const peerName = peerUser?.name || (isSender ? conn.receiverName : conn.senderName);
                const peerDisplayName = formatDisplayName(peerName);
                const peerUsername =
                  peerUser?.username || (isSender ? conn.receiverUsername : conn.senderUsername);
                const peerAvatar =
                  peerUser?.avatar ||
                  (isSender ? conn.receiverAvatar : conn.senderAvatar) ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(peerName)}`;
                const peerRole = peerUser?.role || (isSender ? conn.receiverRole : conn.senderRole);
                const peerCollege =
                  peerUser?.college || (isSender ? conn.receiverCollege : conn.senderCollege);
                const peerDept =
                  peerUser?.department ||
                  (isSender ? conn.receiverDepartment : conn.senderDepartment);

                const fallbackProfile: UserProfile = peerUser || {
                  ...currentUser,
                  id: peerUid,
                  name: peerName,
                  username: peerUsername,
                  avatar: peerAvatar,
                  role: peerRole,
                  college: peerCollege,
                  department: peerDept,
                  skillsToTeach: [],
                  skillsToLearn: [],
                };

                return (
                  <div
                    key={conn.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-4 h-full"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedUserProfile(fallbackProfile)}
                        aria-label={`View profile of ${peerDisplayName}`}
                        className="shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <img
                          src={peerAvatar}
                          alt={peerDisplayName}
                          className="w-12 h-12 rounded-2xl object-cover cursor-pointer"
                        />
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            <button
                              type="button"
                              onClick={() => setSelectedUserProfile(fallbackProfile)}
                              className="text-left hover:text-indigo-600 cursor-pointer truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                            >
                              {peerDisplayName}
                            </button>
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              peerRole === 'teacher'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}
                          >
                            {peerRole === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                          @{peerUsername || peerUid.slice(0, 8)}
                        </p>
                        <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          {peerCollege}
                          {peerDept ? ` • ${peerDept}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                      <button
                        type="button"
                        onClick={() => removeConnection(peerUid)}
                        className={SKILLS_BUTTON_VARIANTS.destructive}
                      >
                        Remove
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedUserProfile(fallbackProfile)}
                          className={SKILLS_BUTTON_VARIANTS.ghost}
                        >
                          View Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => openDirectChat(fallbackProfile)}
                          className={SKILLS_BUTTON_VARIANTS.primary}
                        >
                          <Send className="w-3 h-3" aria-hidden="true" />
                          <span>Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONNECTION REQUESTS (RECEIVED & SENT) */}
      {activeSubTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Received Connection Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Received Connection Requests ({receivedConnectionRequests.length})
            </h2>

            {receivedConnectionRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                No pending received connection requests.
              </div>
            ) : (
              <div className="space-y-3">
                {receivedConnectionRequests.map((req) => {
                  const senderUser = users.find((u) => u.id === req.senderUid);
                  const senderDisplayName = formatDisplayName(req.senderName);
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            req.senderAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(req.senderName)}`
                          }
                          alt={senderDisplayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              <button
                                type="button"
                                onClick={() => senderUser && setSelectedUserProfile(senderUser)}
                                className="text-left hover:text-indigo-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                              >
                                {senderDisplayName}
                              </button>
                            </h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 capitalize">
                              {req.senderRole}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-600 dark:text-slate-300">
                            @{req.senderUsername} • {req.senderCollege}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => acceptConnectionRequest(req.id)}
                          className={SKILLS_BUTTON_VARIANTS.primary}
                        >
                          <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectConnectionRequest(req.id)}
                          className={SKILLS_BUTTON_VARIANTS.destructive}
                        >
                          <UserX className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sent Connection Requests */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Sent Connection Requests ({sentConnectionRequests.length})
            </h2>

            {sentConnectionRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                No pending sent connection requests.
              </div>
            ) : (
              <div className="space-y-3">
                {sentConnectionRequests.map((req) => {
                  const receiverDisplayName = formatDisplayName(req.receiverName);
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            req.receiverAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(req.receiverName)}`
                          }
                          alt={receiverDisplayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {receiverDisplayName}
                            </h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 capitalize">
                              {req.receiverRole}
                            </span>
                          </div>
                          <p className="text-[13px] text-slate-600 dark:text-slate-300">
                            @{req.receiverUsername} • {req.receiverCollege}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => cancelConnectionRequest(req.id)}
                        className={SKILLS_BUTTON_VARIANTS.destructive}
                      >
                        Cancel Request
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {swapTargetUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skills-swap-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setSwapTargetUser(null)}
              aria-label="Close skill swap modal"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
            <h2 id="skills-swap-modal-title" className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1 pr-8">
              Swap Skill with {formatDisplayName(swapTargetUser.name)}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Select what you will teach in return! This creates a live Firebase request and notifies {formatDisplayName(swapTargetUser.name)}.
            </p>

            {swapSuccess ? (
              <div role="status" aria-live="polite" className="py-6 text-center text-emerald-600 font-semibold space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 animate-bounce" aria-hidden="true" />
                <p>Skill Swap Request Delivered!</p>
              </div>
            ) : (
              <form onSubmit={handleSwapSubmit} className="space-y-3">
                <div>
                  <label htmlFor="skills-swap-teach" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Skill You Will Teach
                  </label>
                  <input
                    id="skills-swap-teach"
                    type="text"
                    required
                    value={teachSkillInput}
                    onChange={(e) => setTeachSkillInput(e.target.value)}
                    className="w-full h-10 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="skills-swap-learn" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Skill You Want To Learn
                  </label>
                  <input
                    id="skills-swap-learn"
                    type="text"
                    required
                    value={learnSkillInput}
                    onChange={(e) => setLearnSkillInput(e.target.value)}
                    className="w-full h-10 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="skills-swap-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Personal Message
                  </label>
                  <textarea
                    id="skills-swap-message"
                    rows={3}
                    placeholder="Hey! Are you free for a 1-hour session over Google Meet?"
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSwapTargetUser(null)}
                    className={SKILLS_BUTTON_VARIANTS.outline}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={SKILLS_BUTTON_VARIANTS.primary}
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
