import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  School,
  ArrowLeftRight,
  ShieldCheck,
  MessageSquare,
  Video,
  Users,
  FolderKanban,
  Cpu,
  Compass,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin,
  Menu,
  X,
  Sun,
  Moon,
  Building2,
  Send,
  HelpCircle,
  FileText,
  Lock,
} from 'lucide-react';

export const PublicHomePage: React.FC = () => {
  const {
    isAuthenticated,
    setActiveTab,
    setAuthModalOpen,
    setAuthMode,
    theme,
    toggleTheme,
    currentUser,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    }, 500);
  };

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Features', id: 'features' },
    { name: 'How It Works', id: 'how-it-works' },
    { name: 'Contact', id: 'contact' },
  ];

  const featureItems = [
    {
      icon: ArrowLeftRight,
      title: 'Skill Exchange',
      description: 'Teach what you know and learn something new from peers through reciprocal 1-on-1 swaps.',
      accent: 'from-indigo-500 to-indigo-700',
    },
    {
      icon: ShieldCheck,
      title: 'Mentorship',
      description: 'Connect with teachers, professors, and experienced departmental mentors for academic and career growth.',
      accent: 'from-purple-500 to-purple-700',
    },
    {
      icon: MessageSquare,
      title: 'Chat & Communication',
      description: 'Communicate smoothly through focused private direct messages and collaborative project group rooms.',
      accent: 'from-blue-500 to-blue-700',
    },
    {
      icon: Video,
      title: 'Online Learning Sessions',
      description: 'Arrange one-to-one learning sessions and coordinate live Google Meet meeting links with calendar integration.',
      accent: 'from-emerald-500 to-emerald-700',
    },
    {
      icon: Users,
      title: 'Hackathon Team Builder',
      description: 'Discover teammates with complementary technical skillsets for national and collegiate hackathons.',
      accent: 'from-amber-500 to-amber-700',
    },
    {
      icon: FolderKanban,
      title: 'Project Collaboration',
      description: 'Work collaboratively on major degree projects with milestone schedules, task kanban, and resource links.',
      accent: 'from-rose-500 to-rose-700',
    },
    {
      icon: Cpu,
      title: 'Electronic Hardware Exchange',
      description: 'Reuse, donate, sell, or exchange unused microcontrollers, sensors, breadboards, and lab electronics.',
      accent: 'from-cyan-500 to-cyan-700',
      hasImagePreview: true,
    },
    {
      icon: Compass,
      title: 'Smart Skill Matching',
      description: 'Discover relevant learning partners and tailored collaborative opportunities through AI recommendations.',
      accent: 'from-violet-500 to-violet-700',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ========================================================================= */}
      {/* SECTION A — NAVIGATION BAR                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Institution Lockup */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  SkillSwap AI
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  MANUU ECE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
                Maulana Azad National Urdu University · Hyderabad
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-slate-100/80 dark:hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right: Actions & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-700/20 transition-all cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleOpenLogin}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-700/20 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
              >
                {link.name}
              </button>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('dashboard');
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold text-center"
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenLogin();
                    }}
                    className="flex-1 py-2 text-xs font-semibold text-center border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenRegister();
                    }}
                    className="flex-1 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold text-center"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* SECTION B — HERO SECTION                                                  */}
      {/* ========================================================================= */}
      <section id="home" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Institutional Kicker Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-xs font-medium text-purple-800 dark:text-purple-300">
              <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Department of Electronics and Communication Engineering (ECE)</span>
              <span className="text-slate-400">·</span>
              <span>MANUU, Hyderabad</span>
            </div>
          </div>

          {/* Headline & Supporting Text */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Learn Together.{' '}
              <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Build Together.
              </span>{' '}
              Exchange Smarter.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              SkillSwap AI is a collaborative learning platform where students and teachers connect, exchange skills, share knowledge, and turn ideas into real-world projects.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={isAuthenticated ? () => setActiveTab('dashboard') : handleOpenRegister}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-lg shadow-purple-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Enter Your Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Features</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Presentation */}
          <div className="mt-12 md:mt-16 relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900">
            <img
              src="/src/assets/images/hero_campus_collaboration_1793401263237.jpg"
              alt="Engineering students and faculty collaborating on technology and hardware projects at MANUU"
              className="w-full h-[320px] sm:h-[440px] md:h-[520px] object-cover"
              loading="eager"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Floating Highlights Inside Hero */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-3 text-white">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 max-w-md">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>Maulana Azad National Urdu University (MANUU)</span>
                </div>
                <p className="text-xs text-slate-100 leading-snug">
                  Uniting Electronics & Communication Engineering scholars, faculty mentors, and aspiring innovators.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-purple-600/90 backdrop-blur-md border border-purple-400/30 text-xs font-semibold text-white">
                  ● Real Peer Swaps
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-blue-600/90 backdrop-blur-md border border-blue-400/30 text-xs font-semibold text-white">
                  ● Hardware Component Reuse
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION C — ABOUT SKILLSWAP AI                                            */}
      {/* ========================================================================= */}
      <section id="about" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              About SkillSwap AI
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              What is SkillSwap AI?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              SkillSwap AI is designed to create a collaborative learning ecosystem where knowledge flows between students and teachers. Users can discover skills, connect with learning partners, receive guidance, collaborate on projects, and explore opportunities to grow together.
            </p>
          </div>

          {/* Problem vs Solution Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* The Problem Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-bold">
                <span>The Challenge in Campus Learning</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Barriers Holding Students Back
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong className="text-slate-800 dark:text-slate-200">Difficulty finding learning partners:</strong> Students struggle to locate peers with matching schedules or complementary abilities.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong className="text-slate-800 dark:text-slate-200">Fragmented technical knowledge:</strong> Practical lessons learned in senior years rarely get passed down systematically to junior batches.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong className="text-slate-800 dark:text-slate-200">Lack of guidance for builds:</strong> Hackathon teams and engineering projects stall when students cannot reach faculty advice at crucial milestones.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">✕</div>
                  <span><strong className="text-slate-800 dark:text-slate-200">Unused electronic hardware:</strong> Costly development boards, sensors, and IC components remain idle in drawers after semester labs.</span>
                </li>
              </ul>
            </div>

            {/* The Solution Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-md shadow-purple-500/5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 text-xs font-bold">
                <span>The SkillSwap AI Solution</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                One Unified Campus Ecosystem
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                SkillSwap AI brings these scattered opportunities into a single, cohesive academic network. Developed with the ethos of MANUU's ECE Department, it bridges peer skill exchange, faculty mentorship, hackathon matchmaking, and electronic component recycling under one roof.
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Peer-to-peer 1-on-1 reciprocal skill trades</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Direct faculty guidance and scheduled mentoring sessions</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Cross-semester project incubation and hackathon recruitment</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Sustainable electronic hardware exchange for ECE lab projects</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION D — WHO CAN USE SKILLSWAP AI?                                     */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Community Roles
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Who Can Use SkillSwap AI?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Tailored workspaces specifically designed for students and academic educators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: STUDENTS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-400/50 transition-all space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Students</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Learn faster, trade expertise, and build competitive resumes alongside your peers.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  'Learn technical and academic skills without high coaching fees.',
                  'Find motivated learning partners across semesters and departments.',
                  'Receive one-to-one mentoring from professors and experienced seniors.',
                  'Solve academic and technical doubts with real feedback.',
                  'Get project and hackathon guidance for competitions.',
                  'Share knowledge, notes, code samples, and learning resources.',
                  'Connect with teachers, research scholars, and fellow engineers.',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleOpenRegister}
                className="w-full py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Register as Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: TEACHERS & PROFESSORS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-400/50 transition-all space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Teachers & Professors</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Mentor passionate learners, discover research collaborators, and guide ambitious builds.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {[
                  'Share professional and academic expertise with eager learners.',
                  'Mentor interested students in dedicated 1-on-1 virtual sessions.',
                  'Discover relevant student projects for research and patent opportunities.',
                  'Share educational resources, papers, and lab documentation easily.',
                  'Collaborate on engineering projects and department competitions.',
                  'Explore new tools, libraries, and technologies with tech-savvy students.',
                  'Connect with innovative student communities across campus.',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleOpenRegister}
                className="w-full py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Register as Teacher / Professor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION E — PLATFORM FEATURES                                             */}
      {/* ========================================================================= */}
      <section id="features" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Everything You Need to Exchange Skills & Build
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              A comprehensive toolkit empowering collegiate learning, hardware reuse, and engineering innovation.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              Note: These feature cards describe the platform's intended and evolving capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.accent} flex items-center justify-center text-white shadow-md shadow-slate-500/10`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.hasImagePreview && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 overflow-hidden rounded-xl">
                      <img
                        src="/src/assets/images/electronics_hardware_exchange_1793401262243.jpg"
                        alt="Electronics hardware components available for exchange"
                        className="w-full h-24 object-cover rounded-xl"
                        loading="lazy"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">ECE Department Hardware Pool</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION F — HOW IT WORKS                                                  */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Simple 5-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              How SkillSwap AI Works
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              From creating an account to collaborating on real-world projects in five structured steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Create Your Account',
                description: 'Register as a student or teacher using your university credentials or Google account.',
              },
              {
                step: '02',
                title: 'Build Your Profile',
                description: 'List the skills you can teach, the skills you want to learn, and your academic goals.',
              },
              {
                step: '03',
                title: 'Discover & Connect',
                description: 'Browse the skills directory, discover mentors, or find students working on interesting hardware projects.',
              },
              {
                step: '04',
                title: 'Learn & Collaborate',
                description: 'Exchange knowledge, coordinate online Google Meet sessions, or recruit teammates for hackathons.',
              },
              {
                step: '05',
                title: 'Grow Together',
                description: 'Complete project milestones, share electronic components, and build your technical portfolio.',
              },
            ].map((stepItem, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-extrabold text-sm flex items-center justify-center mb-3">
                    {stepItem.step}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Step {idx + 1} of 5
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION G — WHY CHOOSE SKILLSWAP AI?                                      */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Platform Benefits
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Why Choose SkillSwap AI?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Built intentionally to solve academic isolation and unlock genuine engineering collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Collaborative Learning',
                description: 'Learn through mutual teaching where each student gives knowledge in return for new skills.',
              },
              {
                title: 'Student–Teacher Interaction',
                description: 'Break academic silos and connect directly with knowledgeable department faculty and professors.',
              },
              {
                title: 'Cross-Domain Knowledge Sharing',
                description: 'Bridge software engineering, electronics, AI, UI design, and embedded robotics seamlessly.',
              },
              {
                title: 'Technical Project Development',
                description: 'Find real partners to turn classroom theory into working GitHub repositories and final year builds.',
              },
              {
                title: 'Hackathon Collaboration',
                description: 'Form balanced teams with complementary strengths to win inter-college and national competitions.',
              },
              {
                title: 'Reuse of Electronic Hardware',
                description: 'Sustainably circulate costly sensors, Arduino/ESP32 boards, and lab gear instead of letting them sit idle.',
              },
              {
                title: 'One Platform for Everything',
                description: 'Replace messy WhatsApp groups with structured directories, schedules, and task trackers.',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <h4>{benefit.title}</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION H — PLATFORM VISION                                               */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-purple-500/20 mb-2">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Our Vision
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white max-w-2xl mx-auto">
            Building a Community Where Knowledge Has No Boundaries
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Our vision is to make collaborative learning accessible, encourage knowledge sharing, support innovation, and connect people who want to teach, learn, and create together.
          </p>
          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
            Anchored at Maulana Azad National Urdu University (MANUU), School of Technology, Hyderabad.
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION I — FINAL CALL TO ACTION                                          */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* Background ambient blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Your Skills Can Create Something Amazing.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join a community where everyone has something to teach and something to learn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenRegister}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
            >
              <span>Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION J — CONTACT & FOOTER                                              */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            
            {/* Contact Information & University Details */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  Get in Touch
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Connect With MANUU ECE
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Have questions about student participation, faculty mentorship, or electronic hardware contributions? Reach out to our campus team.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Institution</h5>
                    <p className="text-slate-600 dark:text-slate-400">Maulana Azad National Urdu University (MANUU)</p>
                    <p className="text-slate-500 text-xs">School of Technology (CS & IT / Engineering)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Department Location</h5>
                    <p className="text-slate-600 dark:text-slate-400">Department of Electronics and Communication Engineering (ECE)</p>
                    <p className="text-slate-500 text-xs">Gachibowli, Hyderabad, Telangana 500032, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Project Correspondence</h5>
                    <p className="text-slate-600 dark:text-slate-400">skillswap.ece@manuu.edu.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Campus Inquiry Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Send an Inquiry or Feedback
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                We welcome suggestions from students, faculty, and industry mentors.
              </p>

              {contactSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h5 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Message Received</h5>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Thank you for reaching out! Your inquiry has been noted by the project coordinators.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Farhan Khan"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="student@manuu.edu.in"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Hardware Component Donation / Project Collaboration"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Share your thoughts, questions, or ideas..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Footer Bar */}
          <footer className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100">SkillSwap AI</span>
                <span className="text-slate-400 mx-2">·</span>
                <span>Department of Electronics and Communication Engineering (ECE), MANUU</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                onClick={() => setPrivacyModalOpen(true)}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setTermsModalOpen(true)}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
              >
                Terms & Conditions
              </button>
            </div>
          </footer>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* PRIVACY POLICY MODAL                                                      */}
      {/* ========================================================================= */}
      {privacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setPrivacyModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Privacy Policy</h3>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>1. Institutional Scope:</strong> SkillSwap AI is developed for the Department of Electronics and Communication Engineering (ECE), Maulana Azad National Urdu University (MANUU), Hyderabad.
              </p>
              <p>
                <strong>2. User Data:</strong> We collect display names, academic emails, listed skills, and project summaries solely for the purpose of facilitating peer-to-peer learning and faculty mentorship.
              </p>
              <p>
                <strong>3. Authentication & Security:</strong> Authentication is handled through Firebase Auth with strict role permissions. Passwords and credentials are never stored in plain text.
              </p>
              <p>
                <strong>4. No Commercial Sale:</strong> Data is never sold or shared with commercial advertising brokers.
              </p>
            </div>
            <button
              onClick={() => setPrivacyModalOpen(false)}
              className="w-full py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TERMS AND CONDITIONS MODAL                                                */}
      {/* ========================================================================= */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setTermsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Terms and Conditions</h3>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>1. Code of Academic Conduct:</strong> All interactions between students and faculty must uphold academic integrity, respect, and university guidelines.
              </p>
              <p>
                <strong>2. Skill Swaps:</strong> Peer exchanges are voluntary reciprocal commitments. Participants agree to share knowledge fairly without discriminatory behavior.
              </p>
              <p>
                <strong>3. Hardware Exchange Safety:</strong> Electronic components donated or exchanged should be verified for electrical safety before lab implementation.
              </p>
              <p>
                <strong>4. Account Integrity:</strong> Users are prohibited from misrepresenting their academic status or college affiliation.
              </p>
            </div>
            <button
              onClick={() => setTermsModalOpen(false)}
              className="w-full py-2 rounded-xl bg-purple-700 text-white text-xs font-bold"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
export default PublicHomePage;
