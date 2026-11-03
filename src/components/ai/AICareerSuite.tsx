import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  reviewResumeWithAI,
  generateProjectSuggestionsWithAI,
  fetchSkillRoadmapWithAI,
  fetchInterviewQuestionsWithAI
} from '../../lib/gemini';
import {
  Sparkles, FileText, Lightbulb, MapPin, MessageSquare,
  RefreshCw, CheckCircle2, ChevronDown
} from 'lucide-react';

type CareerToolId = 'resume' | 'projects' | 'roadmap' | 'interview';

/**
 * Standardized button variants for AI Career Suite (max 5 variants)
 * Issue 1: Consolidates 8+ ad-hoc button styles into reusable, accessible variants.
 */
export const CAREER_SUITE_BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs shadow-sm shadow-indigo-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
  secondary:
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
  outline:
    'inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
  tabActive:
    'group relative p-3.5 sm:p-4 rounded-t-2xl rounded-b-none border-2 border-b-0 border-indigo-600 dark:border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-100 text-left transition-all flex flex-col justify-between shadow-sm z-10 -mb-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  tabInactive:
    'group relative p-3.5 sm:p-4 rounded-xl sm:rounded-t-2xl sm:rounded-b-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-800 text-left transition-all flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
} as const;

const CAREER_TOOLS: Array<{
  id: CareerToolId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'resume',
    title: 'AI Resume Reviewer',
    description: 'ATS Score & Keyword Optimizer',
    icon: FileText,
  },
  {
    id: 'projects',
    title: 'AI Project Blueprint',
    description: 'Ideas based on your stack',
    icon: Lightbulb,
  },
  {
    id: 'roadmap',
    title: 'Skill Roadmap',
    description: 'Step-by-step career path',
    icon: MapPin,
  },
  {
    id: 'interview',
    title: 'Mock Interview Coach',
    description: 'Questions & Ideal Answers',
    icon: MessageSquare,
  },
];

export const AICareerSuite: React.FC = () => {
  const { currentUser } = useApp();

  const [activeTool, setActiveTool] = useState<CareerToolId>('resume');
  const [loading, setLoading] = useState(false);
  const tabRefs = useRef<Record<CareerToolId, HTMLButtonElement | null>>({
    resume: null,
    projects: null,
    roadmap: null,
    interview: null,
  });

  // Resume Review state
  const [resumeText, setResumeText] = useState(
    `${currentUser.name}\n${currentUser.college} - ${currentUser.department}\nSkills: React, Node.js, TypeScript, Python, Tailwind\nProjects: SkillSwap AI, Smart Agriculture Monitor\nExperience: Web Developer Intern at TechCorp`
  );
  const [resumeTargetRole, setResumeTargetRole] = useState('Full Stack Software Engineer');
  const [resumeResult, setResumeResult] = useState<any>(null);

  // Project Generator state
  const [projectSkills, setProjectSkills] = useState('React, Python, Gemini AI, Tailwind');
  const [projectDomain, setProjectDomain] = useState('Healthcare & Campus Welfare');
  const [projectResults, setProjectResults] = useState<any>(null);

  // Roadmap state
  const [targetJobRole, setTargetJobRole] = useState('AI & Machine Learning Engineer');
  const [currentSkillsInput, setCurrentSkillsInput] = useState('Python, Basic Linear Algebra, Scikit-Learn');
  const [roadmapResult, setRoadmapResult] = useState<any>(null);

  // Interview Practice state
  const [interviewRole, setInterviewRole] = useState('Frontend Engineer');
  const [interviewTopic, setInterviewTopic] = useState('React Hooks, Performance & Web Vitals');
  const [interviewResults, setInterviewResults] = useState<any>(null);

  // Keyboard navigation for accessible ARIA tablist (Issue 6)
  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const toolOrder = CAREER_TOOLS.map(t => t.id);
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % toolOrder.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + toolOrder.length) % toolOrder.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = toolOrder.length - 1;
    }

    if (nextIndex !== null) {
      const nextTool = toolOrder[nextIndex];
      setActiveTool(nextTool);
      tabRefs.current[nextTool]?.focus();
    }
  };

  // Tool Handlers
  const handleReviewResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    const res = await reviewResumeWithAI(resumeText, resumeTargetRole);
    setResumeResult(res);
    setLoading(false);
  };

  const handleGenerateProjects = async () => {
    setLoading(true);
    const res = await generateProjectSuggestionsWithAI(
      projectDomain,
      'Intermediate',
      projectSkills.split(',').map(s => s.trim())
    );
    setProjectResults(res);
    setLoading(false);
  };

  const handleGenerateRoadmap = async () => {
    setLoading(true);
    const res = await fetchSkillRoadmapWithAI(targetJobRole, currentSkillsInput);
    setRoadmapResult(res);
    setLoading(false);
  };

  const handleGenerateInterview = async () => {
    setLoading(true);
    const res = await fetchInterviewQuestionsWithAI(interviewTopic);
    setInterviewResults(res);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner — Issue 2: Compact hero section so tools and primary action appear higher in viewport */}
      <div className="px-5 py-4 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>AI Career & Mentorship Suite</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Supercharge Your Career with Gemini AI
            </h1>
            <p className="text-xs text-white/90 leading-relaxed">
              Get instant ATS resume reviews, personalized skill roadmaps, AI project blueprints, and mock interview coaching built specifically for students.
            </p>
          </div>
        </div>
      </div>

      {/* Connected Tool Navigation Tabs + Active Tool Container (Issue 6) */}
      <div>
        <div
          role="tablist"
          aria-label="AI Career Suite Tools"
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
        >
          {CAREER_TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                ref={el => {
                  tabRefs.current[tool.id] = el;
                }}
                type="button"
                role="tab"
                id={`career-tab-${tool.id}`}
                aria-selected={isActive}
                aria-controls={`career-tabpanel-${tool.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTool(tool.id)}
                onKeyDown={e => handleTabKeyDown(e, index)}
                className={
                  isActive
                    ? CAREER_SUITE_BUTTON_VARIANTS.tabActive
                    : CAREER_SUITE_BUTTON_VARIANTS.tabInactive
                }
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Select
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {/* Issue 4: Semantic H2 instead of skipped H4 */}
                  <h2
                    className={`text-xs sm:text-sm font-bold leading-snug ${
                      isActive
                        ? 'text-indigo-950 dark:text-white'
                        : 'text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {tool.title}
                  </h2>
                  {/* Issue 3: Minimum 12px (text-xs) with high-contrast readable color */}
                  <p
                    className={`text-xs leading-snug ${
                      isActive
                        ? 'text-indigo-800 dark:text-indigo-200 font-medium'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tool.description}
                  </p>
                </div>

                {/* Non-color visual connector to active form below (Issue 6) */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    className="mt-2 pt-1.5 border-t border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                  >
                    <span>Workspace open below</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tool Form Container — Visually and semantically connected to active tab (Issue 6) */}
        <div
          role="tabpanel"
          id={`career-tabpanel-${activeTool}`}
          aria-labelledby={`career-tab-${activeTool}`}
          className="p-5 sm:p-6 rounded-b-2xl rounded-tr-2xl bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-sm"
        >
          {/* TOOL 1: RESUME REVIEW */}
          {activeTool === 'resume' && (
            <div>
              {/* Section Heading */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>AI Resume Analysis & ATS Score Checker</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Paste your resume text below to generate an instant ATS compatibility score, missing recruiter keywords, and improved action verbs.
                </p>
              </div>

              {/* Issue 7: Clear vertical spacing (mt-5) before the first form field */}
              {/* Issue 5: Balanced layout that avoids tall empty space when no output exists, and expands cleanly when results load */}
              <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className={resumeResult ? 'lg:col-span-6 space-y-4' : 'lg:col-span-7 space-y-4'}>
                  <div>
                    <label
                      htmlFor="resume-target-role"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Target Job Role
                    </label>
                    <input
                      id="resume-target-role"
                      type="text"
                      value={resumeTargetRole}
                      onChange={e => setResumeTargetRole(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="resume-content-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Resume Content
                    </label>
                    <textarea
                      id="resume-content-input"
                      rows={6}
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none font-mono transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleReviewResume}
                    disabled={loading}
                    className={CAREER_SUITE_BUTTON_VARIANTS.primary}
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{loading ? 'Evaluating Resume with Gemini AI...' : 'Analyze Resume'}</span>
                  </button>
                </div>

                {/* Analysis Output Box — Issue 4 (H3 heading) & Issue 5 (Compact empty state, natural expansion on results) */}
                <div
                  className={`${
                    resumeResult ? 'lg:col-span-6' : 'lg:col-span-5'
                  } p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Analysis Output
                    </h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {resumeResult ? 'Complete' : 'Ready'}
                    </span>
                  </div>

                  {resumeResult ? (
                    <div className="space-y-4 text-xs">
                      <div className="p-4 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 text-center">
                        <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 block">
                          {resumeResult.atsScore} / 100
                        </span>
                        <span className="text-xs uppercase font-bold text-slate-600 dark:text-slate-400">
                          ATS Score
                        </span>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                          Missing Recruiter Keywords:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeResult.missingKeywords?.map((kw: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Strength Points:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                          {resumeResult.strengths?.map((s: string, i: number) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                          Improvement Suggestions:
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                          {resumeResult.improvements?.map((imp: string, i: number) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/70 border border-dashed border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        Click <span className="font-semibold text-indigo-600 dark:text-indigo-400">&ldquo;Analyze Resume&rdquo;</span> to trigger AI feedback for <span className="font-semibold text-slate-800 dark:text-slate-200">{resumeTargetRole || 'your target role'}</span>.
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <span className="block font-bold text-slate-700 dark:text-slate-200">ATS Score</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">0–100 rating</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <span className="block font-bold text-slate-700 dark:text-slate-200">Keywords</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Role gaps</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
                          <span className="block font-bold text-slate-700 dark:text-slate-200">Action Tips</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Bullet fixes</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 2: PROJECT GENERATOR */}
          {activeTool === 'projects' && (
            <div>
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>AI Project Idea Generator</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Generate tailored project ideas that impress recruiters and hackathon judges based on your tech stack.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="project-tech-stack"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Your Tech Stack
                    </label>
                    <input
                      id="project-tech-stack"
                      type="text"
                      value={projectSkills}
                      onChange={e => setProjectSkills(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="project-target-domain"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Target Domain / Industry
                    </label>
                    <input
                      id="project-target-domain"
                      type="text"
                      value={projectDomain}
                      onChange={e => setProjectDomain(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateProjects}
                  disabled={loading}
                  className={CAREER_SUITE_BUTTON_VARIANTS.primary}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Brainstorming Project Blueprints...' : 'Generate AI Projects'}</span>
                </button>

                {/* Results Grid */}
                {Array.isArray(projectResults) && projectResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {projectResults.map((proj: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                      >
                        <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {proj.difficulty} Level
                        </span>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">{proj.title}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {proj.summary || proj.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {proj.techStack?.map((tech: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOOL 3: SKILL ROADMAP */}
          {activeTool === 'roadmap' && (
            <div>
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Personalized Career Skill Roadmap</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Receive a customized milestone timeline to transition into your dream tech role.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="roadmap-target-role"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Target Job Role
                    </label>
                    <input
                      id="roadmap-target-role"
                      type="text"
                      value={targetJobRole}
                      onChange={e => setTargetJobRole(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="roadmap-current-skills"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Current Known Skills
                    </label>
                    <input
                      id="roadmap-current-skills"
                      type="text"
                      value={currentSkillsInput}
                      onChange={e => setCurrentSkillsInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateRoadmap}
                  disabled={loading}
                  className={CAREER_SUITE_BUTTON_VARIANTS.primary}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Building Roadmap Path...' : 'Generate Roadmap'}</span>
                </button>

                {roadmapResult && (roadmapResult.weeks || roadmapResult.roadmap) && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Target: {roadmapResult.skillName || targetJobRole} • Duration: {roadmapResult.duration || '4 Weeks'}
                    </div>

                    {(roadmapResult.weeks || roadmapResult.roadmap).map((step: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {step.weekNumber || step.stepNumber || i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                              {step.topic || step.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            Key Concepts: {step.keyConcepts?.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TOOL 4: MOCK INTERVIEW */}
          {activeTool === 'interview' && (
            <div>
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>AI Mock Interview Coaching</span>
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Practice interview questions generated dynamically for your target domain with sample answers.
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="interview-target-role"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Target Role
                    </label>
                    <input
                      id="interview-target-role"
                      type="text"
                      value={interviewRole}
                      onChange={e => setInterviewRole(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="interview-topic-domain"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Interview Topic / Domain
                    </label>
                    <input
                      id="interview-topic-domain"
                      type="text"
                      value={interviewTopic}
                      onChange={e => setInterviewTopic(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateInterview}
                  disabled={loading}
                  className={CAREER_SUITE_BUTTON_VARIANTS.primary}
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Generating Mock Questions...' : 'Start Mock Practice'}</span>
                </button>

                {Array.isArray(interviewResults) && interviewResults.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {interviewResults.map((q: any, i: number) => (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Technical Question #{i + 1}
                        </span>
                        <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100">Q: {q.question}</h3>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                            Expected Key Points:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {q.expectedKeyPoints?.join(' • ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

