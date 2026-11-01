import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StartupIdea } from '../../types';
import { Rocket, Plus, Heart, Users, ShieldCheck, Flame, CheckCircle2, X } from 'lucide-react';

export const StartupHub: React.FC = () => {
  const { startups, addStartupIdea, currentUser, setSelectedUserProfile } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState('All');

  // New startup form
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI & SaaS');
  const [stage, setStage] = useState<'Idea' | 'MVP' | 'Traction' | 'Seed Stage'>('Idea');
  const [lookingForInput, setLookingForInput] = useState('');

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
            <Rocket className="w-3.5 h-3.5 text-emerald-300" />
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
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Pitch Your Startup Idea</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {stages.map((stg) => (
          <button
            key={stg}
            onClick={() => setSelectedStage(stg)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStage === stg
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
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
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {startup.stage} Stage
                </span>
                <span className="text-xs text-slate-400 font-medium">{startup.category}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
                  {startup.title}
                </h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                  "{startup.tagline}"
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {startup.description}
                </p>
              </div>

              {/* Looking for Co-founder */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Looking for Co-founders / Advisors
                </span>
                <div className="flex flex-wrap gap-1">
                  {startup.lookingFor.map((role, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Founder Details */}
              <div className="flex items-center gap-2.5 pt-2">
                <img src={startup.founderAvatar} alt={startup.founderName} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{startup.founderName}</h4>
                  <p className="text-[10px] text-slate-400">{startup.college} • {startup.createdAt}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600">
                  <Flame className="w-4 h-4 fill-emerald-500" />
                  {startup.likes} Upvotes
                </span>
                <span>{startup.mentorsConnected} Mentors Connected</span>
              </div>

              <button className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all">
                Connect with Founder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-5 right-5 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pitch Your Startup Idea</h3>

            <form onSubmit={handleCreateStartup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Startup Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AuraHealth AI"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">One-line Tagline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Empathetic voice AI companion for campus mental health"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Stage</label>
                <select
                  value={stage}
                  onChange={e => setStage(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                >
                  <option value="Idea">Idea Stage</option>
                  <option value="MVP">MVP Stage</option>
                  <option value="Traction">Traction Stage</option>
                  <option value="Seed Stage">Seed Stage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Summary & Market Need</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the target audience, market problem, and unique solution..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Looking for Roles (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Growth Marketer, Mobile Developer, Clinical Advisor"
                  value={lookingForInput}
                  onChange={e => setLookingForInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-md mt-2"
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
