import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  reviewResumeWithAI,
  generateProjectSuggestionsWithAI,
  fetchSkillRoadmapWithAI,
  fetchInterviewQuestionsWithAI
} from '../../lib/gemini';
import {
  Sparkles, FileText, Lightbulb, MapPin, MessageSquare,
  Send, RefreshCw, CheckCircle2, Award, Zap, ArrowRight, Upload
} from 'lucide-react';

export const AICareerSuite: React.FC = () => {
  const { currentUser } = useApp();

  const [activeTool, setActiveTool] = useState<'resume' | 'projects' | 'roadmap' | 'interview'>('resume');
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Career & Mentorship Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Supercharge Your Career with Gemini AI
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
            Get instant ATS resume reviews, personalized skill roadmaps, AI project blueprints, and mock interview coaching built specifically for students.
          </p>
        </div>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTool('resume')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTool === 'resume'
              ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-5 h-5 mb-2 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h4 className="text-xs font-bold">AI Resume Reviewer</h4>
            <p className="text-[10px] text-slate-400">ATS Score & Keyword Optimizer</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('projects')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTool === 'projects'
              ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-5 h-5 mb-2 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="text-xs font-bold">AI Project Blueprint</h4>
            <p className="text-[10px] text-slate-400">Ideas based on your stack</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('roadmap')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTool === 'roadmap'
              ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-5 h-5 mb-2 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h4 className="text-xs font-bold">Skill Roadmap</h4>
            <p className="text-[10px] text-slate-400">Step-by-step career path</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('interview')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            activeTool === 'interview'
              ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-md'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-2 text-amber-600 dark:text-amber-400" />
          <div>
            <h4 className="text-xs font-bold">Mock Interview Coach</h4>
            <p className="text-[10px] text-slate-400">Questions & Ideal Answers</p>
          </div>
        </button>
      </div>

      {/* Tool Container */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* TOOL 1: RESUME REVIEW */}
        {activeTool === 'resume' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>AI Resume Analysis & ATS Score Checker</span>
              </h3>
              <p className="text-xs text-slate-500">
                Paste your resume text below to generate an instant ATS compatibility score, missing recruiter keywords, and improved action verbs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Job Role</label>
                  <input
                    type="text"
                    value={resumeTargetRole}
                    onChange={e => setResumeTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resume Content</label>
                  <textarea
                    rows={8}
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none font-mono"
                  />
                </div>

                <button
                  onClick={handleReviewResume}
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Evaluating Resume with Gemini AI...' : 'Analyze Resume'}</span>
                </button>
              </div>

              {/* Result Box */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Analysis Output</h4>

                {resumeResult ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-indigo-100/70 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-900 text-center">
                      <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 block">
                        {resumeResult.atsScore} / 100
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">ATS Score</span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Missing Recruiter Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {resumeResult.missingKeywords?.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            + {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Strength Points:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {resumeResult.strengths?.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Improvement Suggestions:</span>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        {resumeResult.improvements?.map((imp: string, i: number) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Click "Analyze Resume" to trigger AI feedback.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOOL 2: PROJECT GENERATOR */}
        {activeTool === 'projects' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600" />
                <span>AI Project Idea Generator</span>
              </h3>
              <p className="text-xs text-slate-500">
                Generate tailored project ideas that impress recruiters and hackathon judges based on your tech stack.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Tech Stack</label>
                <input
                  type="text"
                  value={projectSkills}
                  onChange={e => setProjectSkills(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Domain / Industry</label>
                <input
                  type="text"
                  value={projectDomain}
                  onChange={e => setProjectDomain(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateProjects}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Brainstorming Project Blueprints...' : 'Generate AI Projects'}</span>
            </button>

            {/* Results Grid */}
            {Array.isArray(projectResults) && projectResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {projectResults.map((proj: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {proj.difficulty} Level
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{proj.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{proj.summary || proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {proj.techStack?.map((tech: string, i: number) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOOL 3: SKILL ROADMAP */}
        {activeTool === 'roadmap' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Personalized Career Skill Roadmap</span>
              </h3>
              <p className="text-xs text-slate-500">
                Receive a customized milestone timeline to transition into your dream tech role.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Job Role</label>
                <input
                  type="text"
                  value={targetJobRole}
                  onChange={e => setTargetJobRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Known Skills</label>
                <input
                  type="text"
                  value={currentSkillsInput}
                  onChange={e => setCurrentSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Building Roadmap Path...' : 'Generate Roadmap'}</span>
            </button>

            {roadmapResult && (roadmapResult.weeks || roadmapResult.roadmap) && (
              <div className="space-y-3 pt-4">
                <div className="p-3 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Target: {roadmapResult.skillName || targetJobRole} • Duration: {roadmapResult.duration || '4 Weeks'}
                </div>

                {(roadmapResult.weeks || roadmapResult.roadmap).map((step: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {step.weekNumber || step.stepNumber || i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">{step.topic || step.title}</h4>
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
        )}

        {/* TOOL 4: MOCK INTERVIEW */}
        {activeTool === 'interview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                <span>AI Mock Interview Coaching</span>
              </h3>
              <p className="text-xs text-slate-500">
                Practice interview questions generated dynamically for your target domain with sample answers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Role</label>
                <input
                  type="text"
                  value={interviewRole}
                  onChange={e => setInterviewRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Interview Topic / Domain</label>
                <input
                  type="text"
                  value={interviewTopic}
                  onChange={e => setInterviewTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateInterview}
              disabled={loading}
              className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 flex items-center gap-2 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Generating Mock Questions...' : 'Start Mock Practice'}</span>
            </button>

            {Array.isArray(interviewResults) && interviewResults.length > 0 && (
              <div className="space-y-4 pt-4">
                {interviewResults.map((q: any, i: number) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Technical Question #{i + 1}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">Q: {q.question}</h4>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block">Expected Key Points:</span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {q.expectedKeyPoints?.join(' • ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
