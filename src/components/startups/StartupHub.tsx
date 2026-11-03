import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Rocket, Plus, Flame, X } from 'lucide-react';

export const StartupHub: React.FC = () => {
  const { startups, addStartupIdea, currentUser, users, setSelectedUserProfile, setActiveTab } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState('All');

  // New startup form
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category] = useState('AI & SaaS');
  const [stage, setStage] = useState<'Idea' | 'MVP' | 'Traction' | 'Seed Stage'>('Idea');
  const [lookingForInput, setLookingForInput] = useState('');

  useEffect(() => {
    if (!createModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCreateModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createModalOpen]);

  const stages = ['All', 'Idea', 'MVP', 'Traction', 'Seed Stage'];

  const filteredStartups = startups.filter(
    (s) => selectedStage === 'All' || s.stage === selectedStage
  );

  const handleCreateStartup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !tagline.trim()) return;

    addStartupIdea({
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      stage,
      category,
      founderId: currentUser.id,
      founderName: currentUser.name,
      founderAvatar: currentUser.avatar,
      college: currentUser.college,
      lookingFor: lookingForInput.split(',').map((s) => s.trim()).filter(Boolean)
    });

    setTitle('');
    setTagline('');
    setDescription('');
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
            <Rocket className="w-3.5 h-3.5 text-emerald-300" aria-hidden="true" />
            <span>Student Startup Incubator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Launch Your Startup, Find Co-founders & Connect with Mentors
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
            Pitch your student business ideas, connect with university angel investors, and build your founding executive team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Pitch Your Startup Idea</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stages.map((stg) => (
          <button
            key={stg}
            type="button"
            aria-pressed={selectedStage === stg}
            onClick={() => setSelectedStage(stg)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              selectedStage === stg
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {stg}
          </button>
        ))}
      </div>

      {/* Startup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStartups.map((startup) => (
          <div
            key={startup.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {startup.stage} Stage
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{startup.category}</span>
              </div>

              <div>
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
                  {startup.title}
                </h2>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  "{startup.tagline}"
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {startup.description}
                </p>
              </div>

              {/* Looking for Co-founder */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                  Looking for Co-founders / Advisors
                </span>
                <div className="flex flex-wrap gap-1">
                  {startup.lookingFor.map((role, idx) => (
                    <span key={idx} className="text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Founder Details */}
              <div className="flex items-center gap-2.5 pt-2">
                <img src={startup.founderAvatar} alt={startup.founderName} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">{startup.founderName}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{startup.college} • {startup.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                  <Flame className="w-4 h-4 fill-emerald-500" aria-hidden="true" />
                  {startup.likes} Upvotes
                </span>
                <span>{startup.mentorsConnected} Mentors Connected</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const founder = users.find((u) => u.id === startup.founderId);
                  if (founder) {
                    setSelectedUserProfile(founder);
                  } else {
                    setActiveTab('chat');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Connect with Founder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pitch-startup-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              aria-label="Close pitch startup modal"
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <h2 id="pitch-startup-modal-title" className="text-lg font-bold text-slate-800 dark:text-slate-100 pr-8">
              Pitch Your Startup Idea
            </h2>

            <form onSubmit={handleCreateStartup} className="space-y-3">
              <div>
                <label htmlFor="startup-name-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Startup Name
                </label>
                <input
                  id="startup-name-input"
                  type="text"
                  required
                  placeholder="e.g. AuraHealth AI"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="startup-tagline-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  One-line Tagline
                </label>
                <input
                  id="startup-tagline-input"
                  type="text"
                  required
                  placeholder="e.g. Empathetic voice AI companion for campus mental health"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="startup-stage-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Stage
                </label>
                <select
                  id="startup-stage-select"
                  value={stage}
                  onChange={e => setStage(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Idea">Idea Stage</option>
                  <option value="MVP">MVP Stage</option>
                  <option value="Traction">Traction Stage</option>
                  <option value="Seed Stage">Seed Stage</option>
                </select>
              </div>

              <div>
                <label htmlFor="startup-summary-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Summary & Market Need
                </label>
                <textarea
                  id="startup-summary-input"
                  rows={3}
                  required
                  placeholder="Explain the target audience, market problem, and unique solution..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="startup-roles-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Looking for Roles (Comma separated)
                </label>
                <input
                  id="startup-roles-input"
                  type="text"
                  placeholder="Growth Marketer, Mobile Developer, Clinical Advisor"
                  value={lookingForInput}
                  onChange={e => setLookingForInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Publish Startup Pitch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

