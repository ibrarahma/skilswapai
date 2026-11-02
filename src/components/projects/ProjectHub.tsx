import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectItem, ProjectFile } from '../../types';
import {
  FolderKanban,
  Plus,
  Heart,
  MessageSquare,
  Github,
  ExternalLink,
  Upload,
  FileText,
  X,
  Search,
  Lock,
  Globe,
  Edit3,
  Trash2,
  Download,
  User,
  Send,
} from 'lucide-react';

export const ProjectHub: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    toggleProjectLike,
    updateTaskStatus,
    currentUser,
    users,
    setSelectedUserProfile,
    openDirectChat,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'showcase' | 'my-projects' | 'kanban'>(
    'showcase'
  );
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // Create / Edit Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Selected project for Details Modal
  const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);

  // Selected project for Kanban
  const [selectedProjectIdForTasks, setSelectedProjectIdForTasks] = useState<string>('');

  // Form states for new / edited project
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Dev');
  const [status, setStatus] = useState<'Idea' | 'In Progress' | 'Completed'>('In Progress');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [lookingForTeammates, setLookingForTeammates] = useState(true);
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<ProjectFile[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const categories = [
    'All',
    'Web Dev',
    'AI/ML',
    'Mobile App',
    'Cloud/DevOps',
    'Embedded/IoT',
    'VLSI/Hardware',
    'Design/UI',
  ];

  // Filter projects for Showcase or My Projects
  const filteredProjects = projects.filter((p) => {
    if (activeSubTab === 'my-projects' && p.authorId !== currentUser.id) return false;
    if (
      activeSubTab === 'showcase' &&
      p.visibility === 'private' &&
      p.authorId !== currentUser.id
    ) {
      return false;
    }

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      (p.college || '').toLowerCase().includes(q) ||
      p.techStack.some((t) => t.toLowerCase().includes(q)) ||
      (p.requiredSkills || []).some((r) => r.toLowerCase().includes(q));

    const sf = skillFilter.trim().toLowerCase();
    const matchesSkill =
      !sf ||
      p.techStack.some((t) => t.toLowerCase().includes(sf)) ||
      (p.requiredSkills || []).some((r) => r.toLowerCase().includes(sf));

    return matchesCategory && matchesSearch && matchesSkill;
  });

  const activeKanbanProject =
    projects.find((p) => p.id === selectedProjectIdForTasks) || projects[0] || null;

  const resetForm = () => {
    setEditingProjectId(null);
    setTitle('');
    setDescription('');
    setCategory('Web Dev');
    setStatus('In Progress');
    setVisibility('public');
    setTechStackInput('');
    setGithubUrl('');
    setLiveUrl('');
    setLookingForTeammates(true);
    setRequiredSkillsInput('');
    setAttachedFiles([]);
    setFileUploadError(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const handleOpenEditModal = (proj: ProjectItem) => {
    if (proj.authorId !== currentUser.id) return;
    setEditingProjectId(proj.id);
    setTitle(proj.title);
    setDescription(proj.description);
    setCategory(proj.category);
    setStatus(proj.status);
    setVisibility(proj.visibility || 'public');
    setTechStackInput(proj.techStack.join(', '));
    setGithubUrl(proj.githubUrl || '');
    setLiveUrl(proj.liveUrl || '');
    setLookingForTeammates(Boolean(proj.lookingForTeammates));
    setRequiredSkillsInput((proj.requiredSkills || []).join(', '));
    setAttachedFiles(proj.files || []);
    setFileUploadError(null);
    setCreateModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadError(null);
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach((file: File) => {
      if (file.size > 450 * 1024) {
        setFileUploadError(
          `File "${file.name}" exceeds 450 KB direct Firestore document limit. Please attach a smaller PDF/schematic or add a GitHub/Drive link.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = typeof reader.result === 'string' ? reader.result : '';
        const sizeLabel =
          file.size < 1024
            ? `${file.size} B`
            : `${(file.size / 1024).toFixed(1)} KB`;
        const newFile: ProjectFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: file.name,
          size: sizeLabel,
          uploadedAt: new Date().toLocaleDateString(),
          url: resultUrl,
          type: file.type || 'application/octet-stream',
        };
        setAttachedFiles((prev) => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveAttachedFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || publishing) return;

    setPublishing(true);
    try {
      const parsedTech = techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedReqSkills = requiredSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingProjectId) {
        await updateProject(editingProjectId, {
          title: title.trim(),
          description: description.trim(),
          category,
          status,
          visibility,
          techStack: parsedTech,
          githubUrl: githubUrl.trim() || undefined,
          liveUrl: liveUrl.trim() || undefined,
          lookingForTeammates,
          requiredSkills: parsedReqSkills,
          files: attachedFiles,
        });
      } else {
        await addProject({
          title: title.trim(),
          description: description.trim(),
          category,
          status,
          visibility,
          published: true,
          techStack: parsedTech,
          githubUrl: githubUrl.trim() || undefined,
          liveUrl: liveUrl.trim() || undefined,
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorUsername: currentUser.username || currentUser.id.slice(0, 8),
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          college: currentUser.college || currentUser.institution || 'MANUU, Hyderabad',
          department: currentUser.department || 'ECE',
          lookingForTeammates,
          requiredSkills: parsedReqSkills,
          files: attachedFiles,
          tasks: [
            {
              id: `t_${Date.now()}_1`,
              title: 'Define system architecture & component specifications',
              status: 'done',
              assignee: currentUser.name,
            },
            {
              id: `t_${Date.now()}_2`,
              title: 'Implement core module & testing suite',
              status: 'in_progress',
              assignee: currentUser.name,
            },
            {
              id: `t_${Date.now()}_3`,
              title: 'Prepare documentation & final deployment',
              status: 'todo',
              assignee: 'Unassigned',
            },
          ],
          milestones: [
            {
              id: `m_1`,
              title: 'MVP Prototype & Peer Review',
              dueDate: '2026-11-30',
              completed: false,
            },
          ],
        });
      }

      resetForm();
      setCreateModalOpen(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleOpenAuthorProfile = (proj: ProjectItem) => {
    const foundUser = users.find((u) => u.id === proj.authorId);
    if (foundUser) {
      setSelectedUserProfile(foundUser);
    } else if (proj.authorId === currentUser.id) {
      setSelectedUserProfile(currentUser);
    } else {
      setSelectedUserProfile({
        id: proj.authorId,
        name: proj.authorName,
        username: proj.authorUsername || proj.authorId.slice(0, 8),
        email: '',
        role: (proj.authorRole as any) || 'student',
        avatar: proj.authorAvatar,
        college: proj.college || 'MANUU, Hyderabad',
        department: proj.department || 'ECE',
        semester: 0,
        bio: `Author of project "${proj.title}".`,
        location: '',
        githubUrl: proj.githubUrl || '',
        linkedinUrl: '',
        portfolioUrl: proj.liveUrl || '',
        verificationStatus: 'verified',
        availabilityStatus: 'Available for Projects',
        skillsToTeach: [],
        skillsToLearn: [],
        interests: proj.techStack || [],
        certificates: [],
        rating: 5.0,
        reviewCount: 0,
        badges: ['Project Creator 🚀'],
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Campus Project Incubator · Cloud Firestore Synced</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Publish Projects, Share Attachments & Recruit Teammates
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Projects published here are saved to Firebase and immediately discoverable across all authenticated Student and Faculty accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Project</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('showcase')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'showcase'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Published Projects ({projects.filter((p) => p.visibility !== 'private' || p.authorId === currentUser.id).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('my-projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'my-projects'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            My Projects ({projects.filter((p) => p.authorId === currentUser.id).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('kanban')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'kanban'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Kanban Task Manager
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar (for Showcase and My Projects) */}
      {activeSubTab !== 'kanban' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by title, description, author, or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div className="w-full sm:w-56">
              <input
                type="text"
                placeholder="Filter by skill (e.g. React, VLSI)..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Showcase / My Projects Grid */}
      {activeSubTab !== 'kanban' && (
        <>
          {filteredProjects.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FolderKanban className="w-10 h-10 text-indigo-500 mx-auto opacity-80" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {activeSubTab === 'my-projects'
                  ? "You haven't published any projects yet"
                  : 'No published projects match your filter'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Click "Publish New Project" to share your engineering build, attach project documentation, and collaborate with peers and faculty.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                + Publish First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => {
                const hasUpvoted = project.upvotedBy?.includes(currentUser.id);
                const isOwner = project.authorId === currentUser.id;

                return (
                  <div
                    key={project.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Category, Visibility & Status Header */}
                      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {project.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                              project.visibility === 'private'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {project.visibility === 'private' ? (
                              <>
                                <Lock className="w-2.5 h-2.5" />
                                <span>Private</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-2.5 h-2.5" />
                                <span>Public</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full font-semibold ${
                              project.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : project.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            ● {project.status}
                          </span>

                          {isOwner && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(project)}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer"
                                title="Edit your project"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteProject(project.id)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="Delete your project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3
                          onClick={() => setDetailProject(project)}
                          className="font-bold text-base text-slate-800 dark:text-slate-100 hover:text-indigo-600 cursor-pointer mb-1"
                        >
                          {project.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      {/* Tech Stack Chips */}
                      {project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Attachments Preview */}
                      {project.files && project.files.length > 0 && (
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Project Attachments ({project.files.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {project.files.map((f) => (
                              <a
                                key={f.id}
                                href={f.url}
                                download={f.name}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <FileText className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[160px]">{f.name}</span>
                                <span className="text-[10px] text-slate-400">({f.size})</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Looking for teammates callout */}
                      {project.lookingForTeammates &&
                        project.requiredSkills &&
                        project.requiredSkills.length > 0 && (
                          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-xs">
                            <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                              🚀 Looking for Teammates
                            </span>
                            <p className="text-[11px] text-purple-600 dark:text-purple-300/80">
                              Needed: {project.requiredSkills.join(', ')}
                            </p>
                          </div>
                        )}

                      {/* Author Header (Clickable to open uploader's public profile) */}
                      <div
                        onClick={() => handleOpenAuthorProfile(project)}
                        className="flex items-center gap-2.5 pt-2 cursor-pointer group/author"
                      >
                        <img
                          src={project.authorAvatar}
                          alt={project.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover/author:text-indigo-600">
                            {project.authorName}{' '}
                            {project.authorUsername && (
                              <span className="font-mono font-normal text-[11px] text-slate-400">
                                @{project.authorUsername}
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            {project.college} • {project.createdAt}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleProjectLike(project.id)}
                          className={`flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
                            hasUpvoted ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${hasUpvoted ? 'fill-rose-500' : ''}`} />
                          <span>{project.likes}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailProject(project)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          View Details →
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                            title="GitHub Repository"
                          >
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                            title="Live Demo"
                          >
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
        </>
      )}

      {/* Kanban Mode */}
      {activeSubTab === 'kanban' && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              Publish a project first to manage its Kanban tasks.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Select Active Project Board:
                </span>
                <select
                  value={activeKanbanProject?.id || ''}
                  onChange={(e) => setSelectedProjectIdForTasks(e.target.value)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {activeKanbanProject && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        📋 To Do
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">
                        {activeKanbanProject.tasks?.filter((t) => t.status === 'todo').length || 0}
                      </span>
                    </div>
                    {activeKanbanProject.tasks
                      ?.filter((t) => t.status === 'todo')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
                        >
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Assignee: {task.assignee}</span>
                            {activeKanbanProject.authorId === currentUser.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateTaskStatus(activeKanbanProject.id, task.id, 'in_progress')
                                }
                                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                              >
                                Move to In Progress →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* In Progress Column */}
                  <div className="p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-900/40">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        ⚙️ In Progress
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {activeKanbanProject.tasks?.filter((t) => t.status === 'in_progress')
                          .length || 0}
                      </span>
                    </div>
                    {activeKanbanProject.tasks
                      ?.filter((t) => t.status === 'in_progress')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 shadow-sm space-y-2"
                        >
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Assignee: {task.assignee}</span>
                            {activeKanbanProject.authorId === currentUser.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateTaskStatus(activeKanbanProject.id, task.id, 'done')
                                }
                                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                              >
                                Mark Done ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Done Column */}
                  <div className="p-4 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/40">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        ✅ Completed
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        {activeKanbanProject.tasks?.filter((t) => t.status === 'done').length || 0}
                      </span>
                    </div>
                    {activeKanbanProject.tasks
                      ?.filter((t) => t.status === 'done')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 shadow-sm space-y-2 opacity-80"
                        >
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-through">
                            {task.title}
                          </p>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            Completed by {task.assignee}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {detailProject && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 flex items-start justify-center md:py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailProject(null);
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-5 my-auto">
            <button
              type="button"
              onClick={() => setDetailProject(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {detailProject.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ● {detailProject.status}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                {detailProject.visibility || 'public'} project
              </span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {detailProject.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {detailProject.description}
              </p>
            </div>

            {/* Author Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                onClick={() => {
                  const target = detailProject;
                  setDetailProject(null);
                  handleOpenAuthorProfile(target);
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={detailProject.authorAvatar}
                  alt={detailProject.authorName}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600">
                    {detailProject.authorName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {detailProject.college} • Published {detailProject.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailProject;
                    setDetailProject(null);
                    handleOpenAuthorProfile(target);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Uploader Profile</span>
                </button>
                {detailProject.authorId !== currentUser.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const authorUser = users.find((u) => u.id === detailProject.authorId);
                      setDetailProject(null);
                      if (authorUser) openDirectChat(authorUser);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Message Author</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tech Stack & Required Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Technologies & Skills Used
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detailProject.techStack.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {detailProject.requiredSkills && detailProject.requiredSkills.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block mb-1.5">
                    Looking for Teammates With
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {detailProject.requiredSkills.map((r, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project Attachments */}
            {detailProject.files && detailProject.files.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Permitted Project Attachments ({detailProject.files.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {detailProject.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {file.size} • {file.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-indigo-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(detailProject.githubUrl || detailProject.liveUrl) && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {detailProject.githubUrl && (
                  <a
                    href={detailProject.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    <span>View Source Repository</span>
                  </a>
                )}
                {detailProject.liveUrl && (
                  <a
                    href={detailProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live Demo</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 md:py-10">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4 my-auto">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {editingProjectId ? 'Edit Project' : 'Publish New Campus Project'}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Solar Microgrid Telemetry System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    {categories.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="public">Public (All Users)</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Architecture Overview
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what problem your project solves and key technical architecture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tech Stack & Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Firebase, Embedded C, STM32"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Repo URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Live Demo / Doc URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Project Attachments Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Attachments (PDF, Diagrams, Code, Schematics)
                </label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 cursor-pointer text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Select file to attach (up to 450 KB)</span>
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>

                {fileUploadError && (
                  <p className="text-[11px] text-rose-600 mt-1">{fileUploadError}</p>
                )}

                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {attachedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs"
                      >
                        <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                          {f.name} ({f.size})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachedFile(f.id)}
                          className="text-rose-500 hover:text-rose-700 ml-2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="teammates"
                  checked={lookingForTeammates}
                  onChange={(e) => setLookingForTeammates(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label
                  htmlFor="teammates"
                  className="text-xs text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Actively Looking for Student / Faculty Collaborators
                </label>
              </div>

              {lookingForTeammates && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Required Collaborator Skills
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PCB Design, PyTorch, Frontend UI"
                    value={requiredSkillsInput}
                    onChange={(e) => setRequiredSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-md mt-2 cursor-pointer disabled:opacity-50"
              >
                {publishing
                  ? 'Saving to Firebase...'
                  : editingProjectId
                  ? 'Save Project Updates'
                  : 'Publish Project to Campus Hub'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
