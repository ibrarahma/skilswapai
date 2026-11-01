import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectItem, ProjectTask } from '../../types';
import {
  FolderKanban, Plus, Heart, MessageSquare, Github, ExternalLink,
  Upload, CheckSquare, Clock, ShieldCheck, FileText, CheckCircle2, X
} from 'lucide-react';

export const ProjectHub: React.FC = () => {
  const { projects, addProject, toggleProjectLike, updateTaskStatus, currentUser, setSelectedUserProfile } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'showcase' | 'kanban'>('showcase');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<ProjectItem>(projects[0] || null);

  // Form states for new project
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Dev');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [lookingForTeammates, setLookingForTeammates] = useState(true);
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');

  const categories = ['All', 'Web Dev', 'AI/ML', 'Mobile App', 'Cloud/DevOps', 'Design/UI'];

  const filteredProjects = projects.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    addProject({
      title: title.trim(),
      description: description.trim(),
      category,
      techStack: techStackInput.split(',').map((s) => s.trim()).filter(Boolean),
      githubUrl: githubUrl || undefined,
      liveUrl: liveUrl || undefined,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      college: currentUser.college,
      status: 'In Progress',
      lookingForTeammates,
      requiredSkills: requiredSkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      tasks: [
        { id: `t_${Date.now()}_1`, title: 'Design initial database & API architecture', status: 'done', assignee: currentUser.name },
        { id: `t_${Date.now()}_2`, title: 'Build responsive frontend dashboard layout', status: 'in_progress', assignee: currentUser.name },
        { id: `t_${Date.now()}_3`, title: 'Configure deployment pipeline and domain SSL', status: 'todo', assignee: 'Unassigned' },
      ],
      milestones: [
        { id: `m_1`, title: 'MVP Prototype Launch', dueDate: '2026-08-30', completed: false }
      ]
    });

    setTitle('');
    setDescription('');
    setTechStackInput('');
    setGithubUrl('');
    setLiveUrl('');
    setCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Campus Project Incubator</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Showcase Projects, Track Tasks & Recruit Teammates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish your major degree projects, open-source tools, and hackathon builds to receive feedback and peer upvotes.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Project</span>
        </button>
      </div>

      {/* Sub Tabs: Showcase Gallery vs Kanban Task Manager */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'showcase'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Project Showcase Gallery
          </button>
          <button
            onClick={() => setActiveSubTab('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Kanban Task Manager
          </button>
        </div>

        {activeSubTab === 'showcase' && (
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedCategory === c
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Showcase Mode */}
      {activeSubTab === 'showcase' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const hasUpvoted = project.upvotedBy?.includes(currentUser.id);

            return (
              <div
                key={project.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  
                  {/* Category & Status Header */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {project.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full font-semibold ${
                      project.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : project.status === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      ● {project.status}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((tech, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Looking for teammates callout */}
                  {project.lookingForTeammates && (
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs">
                      <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                        🚀 Looking for Teammates
                      </span>
                      <p className="text-[11px] text-purple-600 dark:text-purple-300/80">
                        Needed: {project.requiredSkills?.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Author Header */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <img src={project.authorAvatar} alt={project.authorName} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{project.authorName}</h4>
                      <p className="text-[10px] text-slate-400">{project.college} • {project.createdAt}</p>
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleProjectLike(project.id)}
                      className={`flex items-center gap-1 text-xs font-semibold transition-colors ${
                        hasUpvoted ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasUpvoted ? 'fill-rose-500' : ''}`} />
                      <span>{project.likes}</span>
                    </button>

                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{project.commentsCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Kanban Mode */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Select Active Project Board:</span>
            <select
              value={selectedProjectForTasks?.id}
              onChange={(e) => {
                const p = projects.find(proj => proj.id === e.target.value);
                if (p) setSelectedProjectForTasks(p);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {selectedProjectForTasks && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* To Do Column */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">📋 To Do</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
                    {selectedProjectForTasks.tasks?.filter(t => t.status === 'todo').length || 0}
                  </span>
                </div>
                {selectedProjectForTasks.tasks?.filter(t => t.status === 'todo').map((task) => (
                  <div key={task.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Assignee: {task.assignee}</span>
                      <button
                        onClick={() => updateTaskStatus(selectedProjectForTasks.id, task.id, 'in_progress')}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Move to In Progress →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* In Progress Column */}
              <div className="p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-900/40">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">⚙️ In Progress</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {selectedProjectForTasks.tasks?.filter(t => t.status === 'in_progress').length || 0}
                  </span>
                </div>
                {selectedProjectForTasks.tasks?.filter(t => t.status === 'in_progress').map((task) => (
                  <div key={task.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 shadow-sm space-y-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Assignee: {task.assignee}</span>
                      <button
                        onClick={() => updateTaskStatus(selectedProjectForTasks.id, task.id, 'done')}
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        Mark Done ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Done Column */}
              <div className="p-4 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">✅ Completed</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    {selectedProjectForTasks.tasks?.filter(t => t.status === 'done').length || 0}
                  </span>
                </div>
                {selectedProjectForTasks.tasks?.filter(t => t.status === 'done').map((task) => (
                  <div key={task.id} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 shadow-sm space-y-2 opacity-80">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-through">{task.title}</p>
                    <div className="text-[10px] text-emerald-600 font-semibold">Completed by {task.assignee}</div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-5 right-5 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Publish New Campus Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Autonomous Research Assistant"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                >
                  {categories.slice(1).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description & Architecture Overview</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what problem your project solves and key technical architecture..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tech Stack (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Next.js, Express, Docker, PyTorch, Tailwind CSS"
                  value={techStackInput}
                  onChange={e => setTechStackInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://myproject.vercel.app"
                    value={liveUrl}
                    onChange={e => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="teammates"
                  checked={lookingForTeammates}
                  onChange={e => setLookingForTeammates(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="teammates" className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                  Actively Looking for Student Teammates
                </label>
              </div>

              {lookingForTeammates && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Teammate Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. UI/UX Designer, DevOps, Backend Engineer"
                    value={requiredSkillsInput}
                    onChange={e => setRequiredSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-md mt-2"
              >
                Publish Project & Launch Board
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
