import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserSkill } from '../../types';
import {
  ArrowLeftRight, Search, Filter, Star, ShieldCheck, GraduationCap,
  Sparkles, Check, Send, Award, CheckCircle2
} from 'lucide-react';

export const SkillsExchange: React.FC = () => {
  const { users, currentUser, setSelectedUserProfile, sendSwapRequest, setActiveTab } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [swapTargetUser, setSwapTargetUser] = useState<UserProfile | null>(null);
  const [teachSkillInput, setTeachSkillInput] = useState('');
  const [learnSkillInput, setLearnSkillInput] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);

  const categories = ['All', 'Web Dev', 'AI/ML', 'Mobile App', 'Cloud/DevOps', 'Design/UI', 'Career', 'Business'];
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

  // Filter students who teach skills matching query & filters
  const filteredStudents = users.filter((u) => {
    if (u.id === currentUser.id) return false;

    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.college.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.skillsToTeach.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.skillsToLearn.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      u.skillsToTeach.some((s) => s.category === selectedCategory);

    const matchesLevel =
      selectedLevel === 'All' ||
      u.skillsToTeach.some((s) => s.level === selectedLevel);

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapTargetUser) return;
    sendSwapRequest(swapTargetUser.id, teachSkillInput, learnSkillInput, swapMessage);
    setSwapSuccess(true);
    setTimeout(() => {
      setSwapSuccess(false);
      setSwapTargetUser(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Peer-to-Peer Skill Marketplace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Teach a Skill. Learn a Skill. Zero Cost.
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Swap your technical expertise with students from IITs, BITS, NITs, and premier universities worldwide.
          </p>
        </div>

        <button
          onClick={() => setSelectedUserProfile(currentUser)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
        >
          + Add Your Skills To Teach
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills (e.g. Next.js, Figma, PyTorch, Kubernetes)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
            >
              <option value="All">All Skill Levels</option>
              {levels.slice(1).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No matching student profiles found
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Only verified, genuine registered users are shown here. Try clearing your search filters or invite classmates to register on SkillSwap AI!
          </p>
          {(selectedCategory !== 'All' || selectedLevel !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLevel('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3
                        onClick={() => setSelectedUserProfile(student)}
                        className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 cursor-pointer"
                      >
                        {student.name}
                      </h3>
                      {student.verificationStatus === 'verified' && (
                        <ShieldCheck className="w-4 h-4 text-indigo-500" title="Verified Student" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3 h-3 text-indigo-500" />
                      <span>{student.college}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span>{student.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {student.bio}
              </p>

              {/* Skills to Teach */}
              <div className="space-y-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Can Teach / Mentor
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {student.skillsToTeach.map((st) => (
                    <span
                      key={st.id}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                    >
                      {st.name} ({st.level})
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Looking to Learn
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {student.skillsToLearn.map((sl) => (
                    <span
                      key={sl.id}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-900/40"
                    >
                      {sl.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedUserProfile(student)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
              >
                View Profile
              </button>

              <button
                onClick={() => {
                  setSwapTargetUser(student);
                  setTeachSkillInput(currentUser.skillsToTeach[0]?.name || 'React');
                  setLearnSkillInput(student.skillsToTeach[0]?.name || 'Design');
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Request Swap</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Swap Modal */}
      {swapTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 relative shadow-2xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
              Swap Skill with {swapTargetUser.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Select what you will teach in return!</p>

            {swapSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-semibold space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 animate-bounce" />
                <p>Skill Swap Request Delivered!</p>
              </div>
            ) : (
              <form onSubmit={handleSwapSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill You Will Teach</label>
                  <input
                    type="text"
                    required
                    value={teachSkillInput}
                    onChange={(e) => setTeachSkillInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill You Want To Learn</label>
                  <input
                    type="text"
                    required
                    value={learnSkillInput}
                    onChange={(e) => setLearnSkillInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Message</label>
                  <textarea
                    rows={3}
                    placeholder="Hey! Are you free for a 1-hour session over Google Meet or Discord?"
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSwapTargetUser(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
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
