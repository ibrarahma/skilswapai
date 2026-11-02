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
  Users,
  AlertCircle,
} from 'lucide-react';

// Part 2 Issue 1: Maximum of 5 reusable button variants (Primary, Secondary, Outline, Text-link, Icon-button)
export const PROJECT_HUB_BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50',
  outline:
    'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:opacity-50',
  textLink:
    'inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg',
  iconButton:
    'inline-flex items-center justify-center gap-1.5 min-w-[40px] min-h-[40px] px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
} as const;

// Part 4: Single Reusable URL Validation and Security Function
export interface ProjectUrlValidationResult {
  isValid: boolean;
  sanitizedUrl: string;
  error?: string;
}

export const validateProjectUrl = (
  rawInput?: string,
  kind: 'github' | 'demo' = 'demo'
): ProjectUrlValidationResult => {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) {
    return { isValid: true, sanitizedUrl: '' };
  }

  // Reject unsafe schemes (javascript:, data:, file:, vbscript:, blob:, etc.)
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:')
  ) {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'Unsafe URL scheme rejected. Only HTTP and HTTPS links are allowed.',
    };
  }

  // Never allow GitHub personal access tokens, private credentials, or API keys in URLs
  if (
    /ghp_[a-zA-Z0-9]+|github_pat_[a-zA-Z0-9_]+|gho_[a-zA-Z0-9]+|access_token=|api_key=|client_secret=/i.test(
      trimmed
    )
  ) {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'Never include access tokens, private credentials, or API keys in project URLs.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      sanitizedUrl: '',
      error:
        kind === 'github'
          ? 'Enter a valid GitHub repository URL (e.g., https://github.com/username/project-name).'
          : 'Enter a valid HTTP or HTTPS Live Demo URL (e.g., https://project-name.vercel.app).',
    };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'Only HTTP and HTTPS URLs are permitted.',
    };
  }

  if (parsed.username || parsed.password) {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'URLs containing embedded usernames or passwords are not permitted.',
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!hostname || (!hostname.includes('.') && hostname !== 'localhost')) {
    return {
      isValid: false,
      sanitizedUrl: '',
      error: 'Please enter a valid domain name.',
    };
  }

  if (kind === 'github') {
    const isGithubDomain = hostname === 'github.com' || hostname === 'www.github.com';
    const pathSegments = parsed.pathname.split('/').filter(Boolean);
    if (!isGithubDomain || pathSegments.length < 2) {
      return {
        isValid: false,
        sanitizedUrl: '',
        error:
          'Please enter a valid GitHub repository URL (https://github.com/username/project-name).',
      };
    }
  }

  return {
    isValid: true,
    sanitizedUrl: trimmed,
  };
};

interface ProjectCommentItem {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

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

  // Selected project for Details & Comments Modal
  const [detailProject, setDetailProject] = useState<ProjectItem | null>(null);
  const [projectCommentsByProject, setProjectCommentsByProject] = useState<
    Record<string, ProjectCommentItem[]>
  >({});
  const [commentInput, setCommentInput] = useState('');

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
  const [liveDemoUrl, setLiveDemoUrl] = useState('');
  const [githubUrlError, setGithubUrlError] = useState<string | null>(null);
  const [liveDemoUrlError, setLiveDemoUrlError] = useState<string | null>(null);
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
    setLiveDemoUrl('');
    setGithubUrlError(null);
    setLiveDemoUrlError(null);
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
    setLiveDemoUrl(proj.liveDemoUrl || proj.liveUrl || '');
    setGithubUrlError(null);
    setLiveDemoUrlError(null);
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

    // Validate GitHub Repository URL & Live Demo URL before submission
    const githubCheck = validateProjectUrl(githubUrl, 'github');
    const demoCheck = validateProjectUrl(liveDemoUrl, 'demo');

    setGithubUrlError(githubCheck.isValid ? null : githubCheck.error || 'Invalid GitHub URL.');
    setLiveDemoUrlError(demoCheck.isValid ? null : demoCheck.error || 'Invalid Live Demo URL.');

    if (!githubCheck.isValid || !demoCheck.isValid) {
      return;
    }

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
          githubUrl: githubCheck.sanitizedUrl,
          liveDemoUrl: demoCheck.sanitizedUrl,
          liveUrl: demoCheck.sanitizedUrl,
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
          githubUrl: githubCheck.sanitizedUrl,
          liveDemoUrl: demoCheck.sanitizedUrl,
          liveUrl: demoCheck.sanitizedUrl,
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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailProject || !commentInput.trim()) return;
    const newComment: ProjectCommentItem = {
      id: `cmt_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name || 'Campus Member',
      authorAvatar: currentUser.avatar,
      text: commentInput.trim(),
      createdAt: 'Just now',
    };
    setProjectCommentsByProject((prev) => ({
      ...prev,
      [detailProject.id]: [...(prev[detailProject.id] || []), newComment],
    }));
    setCommentInput('');
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
        portfolioUrl: proj.liveDemoUrl || proj.liveUrl || '',
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

  // Resolve latest detailProject from projects state so live updates reflect immediately
  const activeDetailProject = detailProject
    ? projects.find((p) => p.id === detailProject.id) || detailProject
    : null;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Campus Project Incubator · Cloud Firestore Synced</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Publish Projects, Share Attachments & Recruit Teammates
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Projects published here are saved to Firebase and immediately discoverable across all authenticated Student and Faculty accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className={`${PROJECT_HUB_BUTTON_VARIANTS.primary} shrink-0`}
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Project</span>
        </button>
      </div>

      {/* Unified Navigation Tabs & Aligned Filters Container (Issues 7 & 8) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Issue 7: Differentiated ARIA Tablist with bottom-border indicator */}
        <div
          role="tablist"
          aria-label="Project Hub Views"
          className="flex flex-wrap items-center gap-1 px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'showcase'}
            onClick={() => setActiveSubTab('showcase')}
            className={`px-4 py-2.5 text-xs rounded-t-xl border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeSubTab === 'showcase'
                ? 'border-purple-600 dark:border-purple-400 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 font-semibold'
            }`}
          >
            Project Showcase Gallery (
            {projects.filter((p) => p.visibility !== 'private' || p.authorId === currentUser.id).length}
            )
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'my-projects'}
            onClick={() => setActiveSubTab('my-projects')}
            className={`px-4 py-2.5 text-xs rounded-t-xl border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeSubTab === 'my-projects'
                ? 'border-purple-600 dark:border-purple-400 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 font-semibold'
            }`}
          >
            My Projects ({projects.filter((p) => p.authorId === currentUser.id).length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeSubTab === 'kanban'}
            onClick={() => setActiveSubTab('kanban')}
            className={`px-4 py-2.5 text-xs rounded-t-xl border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
              activeSubTab === 'kanban'
                ? 'border-purple-600 dark:border-purple-400 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 font-semibold'
            }`}
          >
            Kanban Task Manager
          </button>
        </div>

        {/* Issue 8: Aligned Search & Category Filter Controls */}
        {activeSubTab !== 'kanban' && (
          <div className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  aria-label="Search projects by title, description, author, or college"
                  placeholder="Search projects by title, description, author, or college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  aria-label="Filter projects by skill"
                  placeholder="Filter by skill (e.g. React, VLSI)..."
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">
                Category:
              </span>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={
                    selectedCategory === c
                      ? PROJECT_HUB_BUTTON_VARIANTS.secondary
                      : PROJECT_HUB_BUTTON_VARIANTS.outline
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Issue 6: Semantic H2 Section Heading to Prevent H1 -> H3 Skip */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {activeSubTab === 'showcase'
            ? `Project Showcase Gallery (${filteredProjects.length})`
            : activeSubTab === 'my-projects'
            ? `My Published Projects (${filteredProjects.length})`
            : 'Project Kanban Board'}
        </h2>
        {activeSubTab !== 'kanban' && selectedCategory !== 'All' && (
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
            Filtered by: {selectedCategory}
          </span>
        )}
      </div>

      {/* Showcase / My Projects Grid */}
      {activeSubTab !== 'kanban' && (
        <>
          {filteredProjects.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <FolderKanban className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto opacity-80" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {activeSubTab === 'my-projects'
                  ? "You haven't published any projects yet"
                  : 'No published projects match your filter'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Click "Publish New Project" to share your engineering build, link your GitHub repository or live demo, and collaborate with peers and faculty.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className={PROJECT_HUB_BUTTON_VARIANTS.primary}
              >
                <Plus className="w-4 h-4" />
                <span>Publish First Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {filteredProjects.map((project) => {
                const hasUpvoted = project.upvotedBy?.includes(currentUser.id);
                const isOwner = project.authorId === currentUser.id;
                const githubValidation = validateProjectUrl(project.githubUrl, 'github');
                const validGithubUrl =
                  project.githubUrl && githubValidation.isValid
                    ? githubValidation.sanitizedUrl
                    : '';
                const rawDemoUrl = project.liveDemoUrl || project.liveUrl || '';
                const demoValidation = validateProjectUrl(rawDemoUrl, 'demo');
                const validLiveDemoUrl =
                  rawDemoUrl && demoValidation.isValid ? demoValidation.sanitizedUrl : '';
                const extraCommentCount = (projectCommentsByProject[project.id] || []).length;
                const totalCommentsCount = (project.commentsCount || 0) + extraCommentCount;

                return (
                  <article
                    key={project.id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-full"
                  >
                    <div className="space-y-3.5 flex-1 flex flex-col">
                      {/* Grouped Status, Category, Visibility & Owner Controls */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                            {project.category}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              project.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : project.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            ● {project.status}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 ${
                              project.visibility === 'private'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {project.visibility === 'private' ? (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Private</span>
                              </>
                            ) : (
                              <>
                                <Globe className="w-3 h-3" />
                                <span>Public</span>
                              </>
                            )}
                          </span>
                        </div>

                        {isOwner && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(project)}
                              className={PROJECT_HUB_BUTTON_VARIANTS.iconButton}
                              aria-label={`Edit project ${project.title}`}
                              title="Edit project details & links"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProject(project.id)}
                              className={`${PROJECT_HUB_BUTTON_VARIANTS.iconButton} text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40`}
                              aria-label={`Delete project ${project.title}`}
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Issue 2: Visually Prioritized Project Title (H3) & Description */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1.5 break-words">
                          <button
                            type="button"
                            onClick={() => setDetailProject(project)}
                            className="text-left hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg"
                          >
                            {project.title}
                          </button>
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      {/* Tech Stack Chips */}
                      {project.techStack.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Issues 2 & 4: Compact Recruitment Badge + >=12px (text-xs) Secondary Needed Skills */}
                      {project.lookingForTeammates && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-bold">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span>Looking for Teammates</span>
                          </span>
                          {project.requiredSkills &&
                            project.requiredSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50/70 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/40"
                              >
                                Needed: {skill}
                              </span>
                            ))}
                        </div>
                      )}

                      {/* Attachments Preview */}
                      {project.files && project.files.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                            Project Attachments ({project.files.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {project.files.map((f) => (
                              <a
                                key={f.id}
                                href={f.url}
                                download={f.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[160px]">{f.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  ({f.size})
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Part 3 Section 3: GitHub Repository & Live Demo Links on Card */}
                      {(validGithubUrl || validLiveDemoUrl) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 mt-auto">
                          {validGithubUrl && (
                            <a
                              href={validGithubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={PROJECT_HUB_BUTTON_VARIANTS.outline}
                              aria-label={`View GitHub Repository for ${project.title}`}
                            >
                              <Github className="w-4 h-4 shrink-0" />
                              <span>View Repository</span>
                            </a>
                          )}
                          {validLiveDemoUrl && (
                            <a
                              href={validLiveDemoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={PROJECT_HUB_BUTTON_VARIANTS.secondary}
                              aria-label={`Open Live Demo for ${project.title}`}
                            >
                              <Globe className="w-4 h-4 shrink-0" />
                              <span>Live Demo</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Separated Author Metadata & Accessible Social Actions Footer (Issues 2, 5, 9) */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      {/* Author & >=12px (text-xs) University/Date Metadata */}
                      <div
                        onClick={() => handleOpenAuthorProfile(project)}
                        className="flex items-center gap-2.5 cursor-pointer group/author min-w-0"
                      >
                        <img
                          src={project.authorAvatar}
                          alt={project.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover/author:text-indigo-600 dark:group-hover/author:text-indigo-400 truncate">
                            {project.authorName}{' '}
                            {project.authorUsername && (
                              <span className="font-mono font-normal text-xs text-slate-500 dark:text-slate-400">
                                @{project.authorUsername}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            {project.college || 'MANUU, Hyderabad'} • {project.createdAt}
                          </p>
                        </div>
                      </div>

                      {/* Issue 9: >=40x40px Accessible Upvote & Comment Icon Buttons + View Details */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleProjectLike(project.id)}
                          aria-label="Upvote project"
                          aria-pressed={Boolean(hasUpvoted)}
                          title={hasUpvoted ? 'Remove upvote' : 'Upvote project'}
                          className={`${PROJECT_HUB_BUTTON_VARIANTS.iconButton} ${
                            hasUpvoted
                              ? 'border-rose-200 dark:border-rose-800/70 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                              : ''
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${hasUpvoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{project.likes}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailProject(project)}
                          aria-label="View comments"
                          title="View project details and comments"
                          className={PROJECT_HUB_BUTTON_VARIANTS.iconButton}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{totalCommentsCount}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDetailProject(project)}
                          className={`${PROJECT_HUB_BUTTON_VARIANTS.textLink} px-1.5 py-1`}
                        >
                          <span>View Details →</span>
                        </button>
                      </div>
                    </div>
                  </article>
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
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-600 dark:text-slate-300">
              Publish a project first to manage its Kanban tasks.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label
                  htmlFor="kanban-project-select"
                  className="text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  Select Active Project Board:
                </label>
                <select
                  id="kanban-project-select"
                  value={activeKanbanProject?.id || ''}
                  onChange={(e) => setSelectedProjectIdForTasks(e.target.value)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
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
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        📋 To Do
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {activeKanbanProject.tasks?.filter((t) => t.status === 'todo').length || 0}
                      </span>
                    </div>
                    {activeKanbanProject.tasks
                      ?.filter((t) => t.status === 'todo')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2"
                        >
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Assignee: {task.assignee}</span>
                            {activeKanbanProject.authorId === currentUser.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateTaskStatus(activeKanbanProject.id, task.id, 'in_progress')
                                }
                                className={PROJECT_HUB_BUTTON_VARIANTS.textLink}
                              >
                                Move to In Progress →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* In Progress Column */}
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-900/40">
                      <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        ⚙️ In Progress
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {activeKanbanProject.tasks?.filter((t) => t.status === 'in_progress')
                          .length || 0}
                      </span>
                    </div>
                    {activeKanbanProject.tasks
                      ?.filter((t) => t.status === 'in_progress')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 shadow-sm space-y-2"
                        >
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>Assignee: {task.assignee}</span>
                            {activeKanbanProject.authorId === currentUser.id && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateTaskStatus(activeKanbanProject.id, task.id, 'done')
                                }
                                className={PROJECT_HUB_BUTTON_VARIANTS.textLink}
                              >
                                Mark Done ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Done Column */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/40">
                      <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        ✅ Completed
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        {activeKanbanProject.tasks?.filter((t) => t.status === 'done').length || 0}
                      </span>
                    </div>
                    {activeKanbanProject.tasks
                      ?.filter((t) => t.status === 'done')
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 shadow-sm space-y-2 opacity-85"
                        >
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-through">
                            {task.title}
                          </p>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
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

      {/* PROJECT DETAILS & COMMENTS MODAL */}
      {activeDetailProject && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto p-4 flex items-start justify-center md:py-10"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDetailProject(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-modal-title"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-5 my-auto"
          >
            <button
              type="button"
              onClick={() => setDetailProject(null)}
              aria-label="Close project details"
              className={`${PROJECT_HUB_BUTTON_VARIANTS.iconButton} absolute top-5 right-5`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-wrap pr-12">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {activeDetailProject.category}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ● {activeDetailProject.status}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                {activeDetailProject.visibility || 'public'} project
              </span>
              {activeDetailProject.authorId === currentUser.id && (
                <button
                  type="button"
                  onClick={() => {
                    const target = activeDetailProject;
                    setDetailProject(null);
                    handleOpenEditModal(target);
                  }}
                  className={PROJECT_HUB_BUTTON_VARIANTS.outline}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Project & Links</span>
                </button>
              )}
            </div>

            <div>
              <h2
                id="project-detail-modal-title"
                className="text-xl font-extrabold text-slate-900 dark:text-slate-100 break-words"
              >
                {activeDetailProject.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {activeDetailProject.description}
              </p>
            </div>

            {/* External Links (GitHub Repository & Live Demo) */}
            {(() => {
              const ghCheck = validateProjectUrl(activeDetailProject.githubUrl, 'github');
              const validGh =
                activeDetailProject.githubUrl && ghCheck.isValid ? ghCheck.sanitizedUrl : '';
              const rawDemo =
                activeDetailProject.liveDemoUrl || activeDetailProject.liveUrl || '';
              const dmCheck = validateProjectUrl(rawDemo, 'demo');
              const validDm = rawDemo && dmCheck.isValid ? dmCheck.sanitizedUrl : '';

              if (!validGh && !validDm) return null;
              return (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {validGh && (
                    <a
                      href={validGh}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={PROJECT_HUB_BUTTON_VARIANTS.outline}
                    >
                      <Github className="w-4 h-4" />
                      <span>View Repository</span>
                    </a>
                  )}
                  {validDm && (
                    <a
                      href={validDm}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={PROJECT_HUB_BUTTON_VARIANTS.secondary}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>
              );
            })()}

            {/* Author Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                onClick={() => {
                  const target = activeDetailProject;
                  setDetailProject(null);
                  handleOpenAuthorProfile(target);
                }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <img
                  src={activeDetailProject.authorAvatar}
                  alt={activeDetailProject.authorName}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600">
                    {activeDetailProject.authorName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {activeDetailProject.college} • Published {activeDetailProject.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const target = activeDetailProject;
                    setDetailProject(null);
                    handleOpenAuthorProfile(target);
                  }}
                  className={PROJECT_HUB_BUTTON_VARIANTS.outline}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Uploader Profile</span>
                </button>
                {activeDetailProject.authorId !== currentUser.id && (
                  <button
                    type="button"
                    onClick={() => {
                      const authorUser = users.find((u) => u.id === activeDetailProject.authorId);
                      setDetailProject(null);
                      if (authorUser) openDirectChat(authorUser);
                    }}
                    className={PROJECT_HUB_BUTTON_VARIANTS.primary}
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                  Technologies & Skills Used
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeDetailProject.techStack.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {activeDetailProject.requiredSkills &&
                activeDetailProject.requiredSkills.length > 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block mb-1.5">
                      Looking for Teammates With
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDetailProject.requiredSkills.map((r, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Project Attachments */}
            {activeDetailProject.files && activeDetailProject.files.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                  Permitted Project Attachments ({activeDetailProject.files.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeDetailProject.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
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

            {/* Project Comments & Feedback Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Project Discussion & Comments (
                {(activeDetailProject.commentsCount || 0) +
                  (projectCommentsByProject[activeDetailProject.id] || []).length}
                )
              </h3>

              {(projectCommentsByProject[activeDetailProject.id] || []).length === 0 ? (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  No comments yet. Share feedback or ask about collaboration below.
                </p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(projectCommentsByProject[activeDetailProject.id] || []).map((cmt) => (
                    <div
                      key={cmt.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {cmt.authorName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {cmt.createdAt}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{cmt.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment or question about this project..."
                  aria-label="Write a comment"
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button type="submit" className={PROJECT_HUB_BUTTON_VARIANTS.primary}>
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROJECT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-4 md:py-10">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-edit-project-modal-title"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl space-y-4 my-auto"
          >
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              aria-label="Close project form"
              className={`${PROJECT_HUB_BUTTON_VARIANTS.iconButton} absolute top-5 right-5`}
            >
              <X className="w-5 h-5" />
            </button>

            <h2
              id="create-edit-project-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-slate-100 pr-12"
            >
              {editingProjectId ? 'Edit Project' : 'Publish New Campus Project'}
            </h2>

            <form onSubmit={handleSaveProject} className="space-y-3.5" noValidate>
              <div>
                <label
                  htmlFor="project-title-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Project Title
                </label>
                <input
                  id="project-title-input"
                  type="text"
                  required
                  placeholder="e.g. Smart Solar Microgrid Telemetry System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label
                    htmlFor="project-category-select"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="project-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="project-status-select"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="project-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Idea">Idea</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="project-visibility-select"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Visibility
                  </label>
                  <select
                    id="project-visibility-select"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="public">Public (All Users)</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="project-description-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Description & Architecture Overview
                </label>
                <textarea
                  id="project-description-input"
                  rows={3}
                  required
                  placeholder="Explain what problem your project solves and key technical architecture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label
                  htmlFor="project-techstack-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                >
                  Tech Stack & Skills (Comma separated)
                </label>
                <input
                  id="project-techstack-input"
                  type="text"
                  placeholder="React, TypeScript, Firebase, Embedded C, STM32"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Part 3 Section 1: GitHub Repository URL (Optional) & Live Demo URL (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="project-github-url"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                  >
                    GitHub Repository URL (Optional)
                  </label>
                  <input
                    id="project-github-url"
                    type="url"
                    placeholder="https://github.com/username/project-name"
                    value={githubUrl}
                    onChange={(e) => {
                      setGithubUrl(e.target.value);
                      if (githubUrlError) setGithubUrlError(null);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      githubUrlError
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-purple-500'
                    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2`}
                  />
                  {githubUrlError ? (
                    <p
                      role="alert"
                      className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-start gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{githubUrlError}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Public HTTPS GitHub repository link.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="project-livedemo-url"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Live Demo URL (Optional)
                  </label>
                  <input
                    id="project-livedemo-url"
                    type="url"
                    placeholder="https://project-name.vercel.app"
                    value={liveDemoUrl}
                    onChange={(e) => {
                      setLiveDemoUrl(e.target.value);
                      if (liveDemoUrlError) setLiveDemoUrlError(null);
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border ${
                      liveDemoUrlError
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-purple-500'
                    } bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2`}
                  />
                  {liveDemoUrlError ? (
                    <p
                      role="alert"
                      className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-start gap-1"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{liveDemoUrlError}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Deployed web app or live preview link.
                    </p>
                  )}
                </div>
              </div>

              {/* Project Attachments Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Project Attachments (PDF, Diagrams, Code, Schematics)
                </label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 cursor-pointer text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>Select file to attach (up to 450 KB)</span>
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>

                {fileUploadError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{fileUploadError}</p>
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
                          aria-label={`Remove attachment ${f.name}`}
                          className="text-rose-600 hover:text-rose-700 ml-2 cursor-pointer"
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
                  className="rounded-lg text-indigo-600"
                />
                <label
                  htmlFor="teammates"
                  className="text-xs text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Actively Looking for Student / Faculty Collaborators
                </label>
              </div>

              {lookingForTeammates && (
                <div>
                  <label
                    htmlFor="project-required-skills"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                  >
                    Required Collaborator Skills
                  </label>
                  <input
                    id="project-required-skills"
                    type="text"
                    placeholder="e.g. PCB Design, PyTorch, Frontend UI"
                    value={requiredSkillsInput}
                    onChange={(e) => setRequiredSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className={`${PROJECT_HUB_BUTTON_VARIANTS.outline} flex-1 py-2.5`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className={`${PROJECT_HUB_BUTTON_VARIANTS.primary} flex-1 py-2.5`}
                >
                  {publishing
                    ? 'Saving to Firebase...'
                    : editingProjectId
                    ? 'Save Project Updates'
                    : 'Publish Project to Campus Hub'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

