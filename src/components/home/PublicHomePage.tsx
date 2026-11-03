import React, { useState, useEffect } from 'react';
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
  Mail,
  MapPin,
  Menu,
  X,
  Sun,
  Moon,
  Building2,
  Send,
  FileText,
  Lock,
} from 'lucide-react';

/**
 * Reusable 5-variant button system (Fixes Issue #1: Button Consistency)
 * Maximum 5 visual variants with accessible focus-visible rings:
 * 1. primary
 * 2. secondary
 * 3. outline
 * 4. text
 * 5. destructive
 */
export const BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
  secondary:
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/70 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
  outline:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
  text:
    'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
  destructive:
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
} as const;

/**
 * Consistent 6-step Typography System (Fixes Issue #3: Typography Scale)
 * No sub-12px font sizes anywhere on the page.
 */
const TYPOGRAPHY = {
  h1: 'text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]',
  h2: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
  h3Large: 'text-xl font-bold',
  h3Card: 'text-lg font-bold',
  h4: 'text-sm font-bold',
  body: 'text-sm leading-relaxed',
  caption: 'text-xs font-semibold',
} as const;

/**
 * Accessible 5-colour Semantic Text Palette (Fixes Issue #4: Text Colours)
 * High contrast (WCAG AA >= 4.5:1) in both light and dark modes.
 */
const TEXT_COLOR = {
  heading: 'text-slate-900 dark:text-white',
  body: 'text-slate-700 dark:text-slate-300',
  muted: 'text-slate-600 dark:text-slate-400',
  accent: 'text-purple-700 dark:text-purple-300',
  inverse: 'text-white',
} as const;

export const PublicHomePage: React.FC = () => {
  const {
    isAuthenticated,
    setActiveTab,
    setAuthModalOpen,
    setAuthMode,
    theme,
    toggleTheme,
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (privacyModalOpen) setPrivacyModalOpen(false);
        if (termsModalOpen) setTermsModalOpen(false);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [privacyModalOpen, termsModalOpen, mobileMenuOpen]);

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

  // Fixes Issue #7 (Hardware Pool Text >= 12px) & Issue #10 (Standardized icon-based feature cards with equal alignment)
  const featureItems = [
    {
      icon: ArrowLeftRight,
      title: 'Skill Exchange',
      description:
        'Teach what you know and learn something new from peers through reciprocal 1-on-1 swaps.',
      accent: 'from-indigo-600 to-indigo-700',
      footerLabel: 'Peer-to-Peer Learning Pool',
    },
    {
      icon: ShieldCheck,
      title: 'Mentorship',
      description:
        'Connect with teachers, professors, and experienced departmental mentors for academic and career growth.',
      accent: 'from-purple-600 to-purple-700',
      footerLabel: 'Faculty & Senior Guidance',
    },
    {
      icon: MessageSquare,
      title: 'Chat & Communication',
      description:
        'Communicate smoothly through focused private direct messages and collaborative project group rooms.',
      accent: 'from-blue-600 to-blue-700',
      footerLabel: 'Real-Time Messaging Channels',
    },
    {
      icon: Video,
      title: 'Online Learning Sessions',
      description:
        'Arrange one-to-one learning sessions and coordinate live Google Meet meeting links with calendar integration.',
      accent: 'from-indigo-600 to-purple-700',
      footerLabel: 'Live Video & Calendar Sync',
    },
    {
      icon: Users,
      title: 'Hackathon Team Builder',
      description:
        'Discover teammates with complementary technical skillsets for national and collegiate hackathons.',
      accent: 'from-purple-600 to-blue-700',
      footerLabel: 'Cross-Branch Competition Squads',
    },
    {
      icon: FolderKanban,
      title: 'Project Collaboration',
      description:
        'Work collaboratively on major degree projects with milestone schedules, task kanban, and resource links.',
      accent: 'from-blue-600 to-indigo-700',
      footerLabel: 'Milestone & Task Workspace',
    },
    {
      icon: Cpu,
      title: 'Electronic Hardware Exchange',
      description:
        'Reuse, donate, sell, or exchange unused microcontrollers, sensors, breadboards, and lab electronics.',
      accent: 'from-purple-700 to-indigo-600',
      footerLabel: 'ECE Department Hardware Pool',
    },
    {
      icon: Compass,
      title: 'Smart Skill Matching',
      description:
        'Discover relevant learning partners and tailored collaborative opportunities through AI recommendations.',
      accent: 'from-indigo-600 to-blue-600',
      footerLabel: 'AI-Assisted Partner Discovery',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Create Your Account',
      description:
        'Register as a student or teacher using your university credentials or Google account.',
    },
    {
      step: '02',
      title: 'Build Your Profile',
      description:
        'List the skills you can teach, the skills you want to learn, and your academic goals.',
    },
    {
      step: '03',
      title: 'Discover & Connect',
      description:
        'Browse the skills directory, discover mentors, or find students working on interesting hardware projects.',
    },
    {
      step: '04',
      title: 'Learn & Collaborate',
      description:
        'Exchange knowledge, coordinate online Google Meet sessions, or recruit teammates for hackathons.',
    },
    {
      step: '05',
      title: 'Grow Together',
      description:
        'Complete project milestones, share electronic components, and build your technical portfolio.',
    },
  ];

  const whyChooseBenefits = [
    {
      title: 'Collaborative Learning',
      description:
        'Learn through mutual teaching where each student gives knowledge in return for new skills.',
    },
    {
      title: 'Student–Teacher Interaction',
      description:
        'Break academic silos and connect directly with knowledgeable department faculty and professors.',
    },
    {
      title: 'Cross-Domain Knowledge Sharing',
      description:
        'Bridge software engineering, electronics, AI, UI design, and embedded robotics seamlessly.',
    },
    {
      title: 'Technical Project Development',
      description:
        'Find real partners to turn classroom theory into working GitHub repositories and final year builds.',
    },
    {
      title: 'Hackathon Collaboration',
      description:
        'Form balanced teams with complementary strengths to win inter-college and national competitions.',
    },
    {
      title: 'Reuse of Electronic Hardware',
      description:
        'Sustainably circulate costly sensors, Arduino/ESP32 boards, and lab gear instead of letting them sit idle.',
    },
    {
      title: 'One Platform for Everything',
      description:
        'Replace messy WhatsApp groups with structured directories, schedules, and task trackers.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-200">
      <a
        href="#public-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-purple-700 focus:text-white focus:text-xs focus:font-bold focus:shadow-lg"
      >
        Skip to main content
      </a>
      {/* ========================================================================= */}
      {/* SECTION A — NAVIGATION BAR                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Institution Lockup */}
          <button
            type="button"
            onClick={() => scrollToSection('home')}
            aria-label="SkillSwap AI MANUU ECE Home"
            className="flex items-center gap-3 text-left cursor-pointer group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  SkillSwap AI
                </span>
                <span
                  className={`hidden sm:inline-block ${TYPOGRAPHY.caption} px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 ${TEXT_COLOR.accent}`}
                >
                  MANUU ECE
                </span>
              </div>
              {/* Fixes Issue #5: University text increased from 11px to 13-14px (text-sm) while preserving responsive visibility */}
              <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.muted} hidden md:block`}>
                Maulana Azad National Urdu University · Hyderabad
              </p>
            </div>
          </button>

          {/* Center: Desktop Navigation Links */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className={BUTTON_VARIANTS.text}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right: Actions & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={BUTTON_VARIANTS.outline}
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={BUTTON_VARIANTS.primary}
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className={BUTTON_VARIANTS.outline}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={handleOpenRegister}
                  className={BUTTON_VARIANTS.primary}
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden ${BUTTON_VARIANTS.outline}`}
              aria-label="Open Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`${BUTTON_VARIANTS.text} w-full justify-start`}
                >
                  {link.name}
                </button>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('dashboard');
                  }}
                  className={`${BUTTON_VARIANTS.primary} w-full`}
                >
                  Open Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenLogin();
                    }}
                    className={`${BUTTON_VARIANTS.outline} flex-1`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenRegister();
                    }}
                    className={`${BUTTON_VARIANTS.primary} flex-1`}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main id="public-main-content" tabIndex={-1} className="outline-none">
      {/* ========================================================================= */}
      {/* SECTION B — HERO SECTION                                                  */}
      {/* ========================================================================= */}
      <section id="home" className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Institutional Kicker Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 ${TYPOGRAPHY.caption} ${TEXT_COLOR.accent}`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Department of Electronics and Communication Engineering (ECE)</span>
              <span aria-hidden="true">·</span>
              <span>MANUU, Hyderabad</span>
            </div>
          </div>

          {/* Headline & Supporting Text */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className={`${TYPOGRAPHY.h1} ${TEXT_COLOR.heading}`}>
              Learn Together.{' '}
              <span className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Build Together.
              </span>{' '}
              Exchange Smarter.
            </h1>
            <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body} max-w-2xl mx-auto`}>
              SkillSwap AI is a collaborative learning platform where students and teachers connect, exchange skills, share knowledge, and turn ideas into real-world projects.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={isAuthenticated ? () => setActiveTab('dashboard') : handleOpenRegister}
                className={`${BUTTON_VARIANTS.primary} w-full sm:w-auto`}
              >
                <span>{isAuthenticated ? 'Enter Your Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className={`${BUTTON_VARIANTS.outline} w-full sm:w-auto`}
              >
                <span>Explore Features</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Presentation — Fixes Issue #2: Reduced from 520px to 320-360px on desktop with responsive aspect ratio and object-cover */}
          <div className="mt-10 md:mt-12 relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900">
            <img
              src="/src/assets/images/hero_campus_collaboration_1793401263237.jpg"
              alt="Engineering students and faculty collaborating on technology and hardware projects at MANUU"
              className="w-full aspect-[16/9] md:aspect-[21/9] h-[240px] sm:h-[300px] md:h-[340px] max-h-[360px] object-cover object-center"
              loading="eager"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

            {/* Floating Highlights Inside Hero */}
            <div
              className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-wrap items-center justify-between gap-3 ${TEXT_COLOR.inverse}`}
            >
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-white/20 max-w-md">
                <div className={`flex items-center gap-2 ${TYPOGRAPHY.caption} ${TEXT_COLOR.inverse} mb-1`}>
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>Maulana Azad National Urdu University (MANUU)</span>
                </div>
                <p className={`${TYPOGRAPHY.caption} ${TEXT_COLOR.inverse} font-normal leading-snug`}>
                  Uniting Electronics & Communication Engineering scholars, faculty mentors, and aspiring innovators.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl bg-purple-700/95 backdrop-blur-md border border-white/20 ${TYPOGRAPHY.caption} ${TEXT_COLOR.inverse}`}
                >
                  ● Real Peer Swaps
                </span>
                <span
                  className={`px-3 py-1.5 rounded-xl bg-blue-700/95 backdrop-blur-md border border-white/20 ${TYPOGRAPHY.caption} ${TEXT_COLOR.inverse}`}
                >
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
      <section
        id="about"
        className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            {/* Fixes Issue #6: Sentence case "About SkillSwap AI" */}
            <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
              About SkillSwap AI
            </span>
            <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading}`}>What is SkillSwap AI?</h2>
            <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
              SkillSwap AI is designed to create a collaborative learning ecosystem where knowledge flows between students and teachers. Users can discover skills, connect with learning partners, receive guidance, collaborate on projects, and explore opportunities to grow together.
            </p>
          </div>

          {/* Problem vs Solution Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Problem Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 ${TYPOGRAPHY.caption} ${TEXT_COLOR.accent}`}
              >
                <span>The Challenge in Campus Learning</span>
              </div>
              <h3 className={`${TYPOGRAPHY.h3Large} ${TEXT_COLOR.heading}`}>
                Barriers Holding Students Back
              </h3>
              <ul className={`space-y-3 ${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                <li className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/80 ${TEXT_COLOR.accent} flex items-center justify-center shrink-0 mt-0.5 ${TYPOGRAPHY.caption}`}
                  >
                    ✕
                  </div>
                  <span>
                    <strong className={TEXT_COLOR.heading}>Difficulty finding learning partners:</strong>{' '}
                    Students struggle to locate peers with matching schedules or complementary abilities.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/80 ${TEXT_COLOR.accent} flex items-center justify-center shrink-0 mt-0.5 ${TYPOGRAPHY.caption}`}
                  >
                    ✕
                  </div>
                  <span>
                    <strong className={TEXT_COLOR.heading}>Fragmented technical knowledge:</strong>{' '}
                    Practical lessons learned in senior years rarely get passed down systematically to junior batches.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/80 ${TEXT_COLOR.accent} flex items-center justify-center shrink-0 mt-0.5 ${TYPOGRAPHY.caption}`}
                  >
                    ✕
                  </div>
                  <span>
                    <strong className={TEXT_COLOR.heading}>Lack of guidance for builds:</strong>{' '}
                    Hackathon teams and engineering projects stall when students cannot reach faculty advice at crucial milestones.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full bg-purple-50 dark:bg-purple-950/80 ${TEXT_COLOR.accent} flex items-center justify-center shrink-0 mt-0.5 ${TYPOGRAPHY.caption}`}
                  >
                    ✕
                  </div>
                  <span>
                    <strong className={TEXT_COLOR.heading}>Unused electronic hardware:</strong>{' '}
                    Costly development boards, sensors, and IC components remain idle in drawers after semester labs.
                  </span>
                </li>
              </ul>
            </div>

            {/* The Solution Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-md shadow-purple-500/5 space-y-4">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 ${TYPOGRAPHY.caption} ${TEXT_COLOR.accent}`}
              >
                <span>The SkillSwap AI Solution</span>
              </div>
              <h3 className={`${TYPOGRAPHY.h3Large} ${TEXT_COLOR.heading}`}>
                One Unified Campus Ecosystem
              </h3>
              <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                SkillSwap AI brings these scattered opportunities into a single, cohesive academic network. Developed with the ethos of MANUU's ECE Department, it bridges peer skill exchange, faculty mentorship, hackathon matchmaking, and electronic component recycling under one roof.
              </p>
              <div className="space-y-2.5 pt-1">
                <div className={`flex items-center gap-2.5 ${TYPOGRAPHY.body} ${TEXT_COLOR.body} font-medium`}>
                  <CheckCircle2 className={`w-4 h-4 ${TEXT_COLOR.accent} shrink-0`} />
                  <span>Peer-to-peer 1-on-1 reciprocal skill trades</span>
                </div>
                <div className={`flex items-center gap-2.5 ${TYPOGRAPHY.body} ${TEXT_COLOR.body} font-medium`}>
                  <CheckCircle2 className={`w-4 h-4 ${TEXT_COLOR.accent} shrink-0`} />
                  <span>Direct faculty guidance and scheduled mentoring sessions</span>
                </div>
                <div className={`flex items-center gap-2.5 ${TYPOGRAPHY.body} ${TEXT_COLOR.body} font-medium`}>
                  <CheckCircle2 className={`w-4 h-4 ${TEXT_COLOR.accent} shrink-0`} />
                  <span>Cross-semester project incubation and hackathon recruitment</span>
                </div>
                <div className={`flex items-center gap-2.5 ${TYPOGRAPHY.body} ${TEXT_COLOR.body} font-medium`}>
                  <CheckCircle2 className={`w-4 h-4 ${TEXT_COLOR.accent} shrink-0`} />
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
            <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
              Community Roles
            </span>
            <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading}`}>Who Can Use SkillSwap AI?</h2>
            <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
              Tailored workspaces specifically designed for students and academic educators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: STUDENTS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-400/50 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div
                  className={`w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 ${TEXT_COLOR.accent} flex items-center justify-center`}
                >
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.h3Large} ${TEXT_COLOR.heading}`}>For Students</h3>
                  <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.muted} mt-1`}>
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
                    <div key={idx} className={`flex items-start gap-2.5 ${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                      <CheckCircle2 className={`w-4 h-4 ${TEXT_COLOR.accent} shrink-0 mt-1`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenRegister}
                className={`${BUTTON_VARIANTS.secondary} w-full`}
              >
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: TEACHERS & PROFESSORS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-400/50 transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div
                  className={`w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 ${TEXT_COLOR.accent} flex items-center justify-center`}
                >
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`${TYPOGRAPHY.h3Large} ${TEXT_COLOR.heading}`}>
                    For Teachers & Professors
                  </h3>
                  <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.muted} mt-1`}>
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
                    <div key={idx} className={`flex items-start gap-2.5 ${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                      <CheckCircle2 className={`w-4 h-4 ${TEXT_COLOR.accent} shrink-0 mt-1`} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenRegister}
                className={`${BUTTON_VARIANTS.secondary} w-full`}
              >
                <span>Register as Teacher / Professor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION E — PLATFORM FEATURES                                             */}
      {/* ========================================================================= */}
      <section
        id="features"
        className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
              Platform Features
            </span>
            <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading}`}>
              Everything You Need to Exchange Skills & Build
            </h2>
            <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
              A comprehensive toolkit empowering collegiate learning, hardware reuse, and engineering innovation.
            </p>
            <p className={`${TYPOGRAPHY.caption} ${TEXT_COLOR.muted} font-normal italic`}>
              Note: These feature cards describe the platform's intended and evolving capabilities.
            </p>
          </div>

          {/* Fixes Issue #7 & Issue #10: Consistent icon-based layout across all 8 cards with equal height and >=12px readable footer caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {featureItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="h-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.accent} flex items-center justify-center ${TEXT_COLOR.inverse} shadow-md shadow-slate-500/10`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`${TYPOGRAPHY.h3Card} ${TEXT_COLOR.heading}`}>{item.title}</h3>
                    <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>{item.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className={`block ${TYPOGRAPHY.caption} ${TEXT_COLOR.muted}`}>
                      {item.footerLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION F — HOW IT WORKS (Fixes Issue #11: Responsive 3+2 Grid)           */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
              Simple 5-Step Process
            </span>
            <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading}`}>How SkillSwap AI Works</h2>
            <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
              From creating an account to collaborating on real-world projects in five structured steps.
            </p>
          </div>

          {/* 3+2 responsive grid: 1 col on mobile, 2 cols on tablet (5th centered), 3 cols on top row + 2 centered cols on bottom row on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 items-stretch">
            {howItWorksSteps.map((stepItem, idx) => {
              let gridPlacement = 'lg:col-span-2';
              if (idx === 3) {
                gridPlacement = 'lg:col-span-2 lg:col-start-2';
              } else if (idx === 4) {
                gridPlacement =
                  'sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full lg:col-span-2 lg:col-start-4 lg:max-w-none lg:mx-0';
              }

              return (
                <div
                  key={idx}
                  className={`${gridPlacement} p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 ${TEXT_COLOR.accent} font-extrabold text-sm flex items-center justify-center`}
                    >
                      {stepItem.step}
                    </div>
                    <h3 className={`${TYPOGRAPHY.h3Card} ${TEXT_COLOR.heading}`}>{stepItem.title}</h3>
                    <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>{stepItem.description}</p>
                  </div>
                  <div className={`pt-3 border-t border-slate-100 dark:border-slate-800 ${TYPOGRAPHY.caption} ${TEXT_COLOR.accent}`}>
                    Step {idx + 1} of 5
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION G — WHY CHOOSE SKILLSWAP AI? (Fixes Issue #8 & Issue #12)         */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-12 md:mb-16">
            <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
              Platform Benefits
            </span>
            <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading}`}>Why Choose SkillSwap AI?</h2>
            <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
              Built intentionally to solve academic isolation and unlock genuine engineering collaboration.
            </p>
          </div>

          {/* Fixes Issue #12: Responsive 4+3 grid on desktop (8-col grid where each card spans 2 cols, and the final 3 cards start at col 2 to center nicely) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-6 items-stretch">
            {whyChooseBenefits.map((benefit, idx) => {
              let gridPlacement = 'lg:col-span-2';
              if (idx === 4) {
                gridPlacement = 'lg:col-span-2 lg:col-start-2';
              } else if (idx === 6) {
                gridPlacement =
                  'sm:col-span-2 sm:max-w-md sm:mx-auto sm:w-full lg:col-span-2 lg:max-w-none lg:mx-0';
              }

              return (
                <div
                  key={idx}
                  className={`${gridPlacement} p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 flex flex-col justify-between`}
                >
                  <div className="space-y-2">
                    <div className={`flex items-center gap-2 ${TEXT_COLOR.accent}`}>
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      {/* Fixes Issue #8: Semantic H3 heading under H2 while preserving visual appearance */}
                      <h3 className={`${TYPOGRAPHY.h4} ${TEXT_COLOR.heading}`}>{benefit.title}</h3>
                    </div>
                    <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION H — PLATFORM VISION                                               */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 to-blue-600 mx-auto flex items-center justify-center ${TEXT_COLOR.inverse} shadow-lg shadow-purple-500/20 mb-2`}
          >
            <Compass className="w-6 h-6" />
          </div>
          <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
            Our Vision
          </span>
          <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading} max-w-2xl mx-auto`}>
            Building a Community Where Knowledge Has No Boundaries
          </h2>
          <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body} max-w-2xl mx-auto`}>
            Our vision is to make collaborative learning accessible, encourage knowledge sharing, support innovation, and connect people who want to teach, learn, and create together.
          </p>
          <div className={`pt-2 ${TYPOGRAPHY.caption} font-normal ${TEXT_COLOR.muted}`}>
            Anchored at Maulana Azad National Urdu University (MANUU), School of Technology, Hyderabad.
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION I — FINAL CALL TO ACTION                                          */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-20 bg-purple-50/70 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading}`}>
            Your Skills Can Create Something Amazing.
          </h2>
          <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body} max-w-xl mx-auto`}>
            Join a community where everyone has something to teach and something to learn.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenRegister}
              className={`${BUTTON_VARIANTS.primary} w-full sm:w-auto`}
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenLogin}
              className={`${BUTTON_VARIANTS.outline} w-full sm:w-auto`}
            >
              <span>Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION J — CONTACT & FOOTER                                              */}
      {/* ========================================================================= */}
      <section
        id="contact"
        className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
            {/* Contact Information & University Details */}
            <div className="space-y-6">
              <div>
                <span className={`inline-block ${TYPOGRAPHY.caption} tracking-wide ${TEXT_COLOR.accent}`}>
                  Get in Touch
                </span>
                <h2 className={`${TYPOGRAPHY.h2} ${TEXT_COLOR.heading} mt-1`}>
                  Connect With MANUU ECE
                </h2>
                <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body} mt-2`}>
                  Have questions about student participation, faculty mentorship, or electronic hardware contributions? Reach out to our campus team.
                </p>
              </div>

              <div className={`space-y-4 ${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${TEXT_COLOR.accent} shrink-0`}
                  >
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    {/* Fixes Issue #9: Semantic H3 heading under H2 while preserving visual styling */}
                    <h3 className={`${TYPOGRAPHY.h4} ${TEXT_COLOR.heading}`}>Institution</h3>
                    <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                      Maulana Azad National Urdu University (MANUU)
                    </p>
                    <p className={`${TYPOGRAPHY.caption} font-normal ${TEXT_COLOR.muted}`}>
                      School of Technology (CS & IT / Engineering)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${TEXT_COLOR.accent} shrink-0`}
                  >
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    {/* Fixes Issue #9: Semantic H3 heading under H2 */}
                    <h3 className={`${TYPOGRAPHY.h4} ${TEXT_COLOR.heading}`}>Department Location</h3>
                    <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                      Department of Electronics and Communication Engineering (ECE)
                    </p>
                    <p className={`${TYPOGRAPHY.caption} font-normal ${TEXT_COLOR.muted}`}>
                      Gachibowli, Hyderabad, Telangana 500032, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${TEXT_COLOR.accent} shrink-0`}
                  >
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    {/* Fixes Issue #9: Semantic H3 heading under H2 */}
                    <h3 className={`${TYPOGRAPHY.h4} ${TEXT_COLOR.heading}`}>
                      Project Correspondence
                    </h3>
                    <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                      skillswap.ece@manuu.edu.in
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Campus Inquiry Form */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className={`${TYPOGRAPHY.h3Card} ${TEXT_COLOR.heading} mb-1`}>
                Send an Inquiry or Feedback
              </h3>
              <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.muted} mb-5`}>
                We welcome suggestions from students, faculty, and industry mentors.
              </p>

              {contactSubmitted ? (
                <div role="status" aria-live="polite" className="p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-3">
                  <CheckCircle2 className={`w-10 h-10 ${TEXT_COLOR.accent} mx-auto`} aria-hidden="true" />
                  <h4 className={`${TYPOGRAPHY.h4} ${TEXT_COLOR.heading}`}>Message Received</h4>
                  <p className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body}`}>
                    Thank you for reaching out! Your inquiry has been noted by the project coordinators.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSubmitted(false)}
                    className={BUTTON_VARIANTS.primary}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className={`block ${TYPOGRAPHY.caption} ${TEXT_COLOR.body} mb-1`}
                      >
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. Farhan Khan"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className={`w-full px-3.5 py-2.5 ${TYPOGRAPHY.body} rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${TEXT_COLOR.heading} outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contact-email"
                        className={`block ${TYPOGRAPHY.caption} ${TEXT_COLOR.body} mb-1`}
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="student@manuu.edu.in"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={`w-full px-3.5 py-2.5 ${TYPOGRAPHY.body} rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${TEXT_COLOR.heading} outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className={`block ${TYPOGRAPHY.caption} ${TEXT_COLOR.body} mb-1`}
                    >
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="e.g. Hardware Component Donation / Project Collaboration"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className={`w-full px-3.5 py-2.5 ${TYPOGRAPHY.body} rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${TEXT_COLOR.heading} outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className={`block ${TYPOGRAPHY.caption} ${TEXT_COLOR.body} mb-1`}
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={3}
                      required
                      placeholder="Share your thoughts, questions, or ideas..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className={`w-full p-3 ${TYPOGRAPHY.body} rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${TEXT_COLOR.heading} outline-none focus-visible:ring-2 focus-visible:ring-purple-500`}
                    />
                  </div>

                  <button type="submit" className={`${BUTTON_VARIANTS.primary} w-full`}>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer Bar */}
          <footer
            className={`pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 ${TYPOGRAPHY.body} ${TEXT_COLOR.muted}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center ${TEXT_COLOR.inverse} shrink-0`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className={`font-bold ${TEXT_COLOR.heading}`}>SkillSwap AI</span>
                <span className="mx-2" aria-hidden="true">
                  ·
                </span>
                <span>Department of Electronics and Communication Engineering (ECE), MANUU</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={BUTTON_VARIANTS.text}
                >
                  {link.name}
                </button>
              ))}
              <span className={TEXT_COLOR.muted} aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(true)}
                className={BUTTON_VARIANTS.text}
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setTermsModalOpen(true)}
                className={BUTTON_VARIANTS.text}
              >
                Terms & Conditions
              </button>
            </div>
          </footer>
        </div>
      </section>
      </main>

      {/* ========================================================================= */}
      {/* PRIVACY POLICY MODAL                                                      */}
      {/* ========================================================================= */}
      {privacyModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-2 ${TEXT_COLOR.accent}`}>
                <Lock className="w-5 h-5" />
                <h3 id="privacy-modal-title" className={`${TYPOGRAPHY.h3Card} ${TEXT_COLOR.heading}`}>
                  Privacy Policy
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPrivacyModalOpen(false)}
                className={BUTTON_VARIANTS.outline}
                aria-label="Close Privacy Policy Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body} space-y-2`}>
              <p>
                <strong className={TEXT_COLOR.heading}>1. Institutional Scope:</strong> SkillSwap AI is developed for the Department of Electronics and Communication Engineering (ECE), Maulana Azad National Urdu University (MANUU), Hyderabad.
              </p>
              <p>
                <strong className={TEXT_COLOR.heading}>2. User Data:</strong> We collect display names, academic emails, listed skills, and project summaries solely for the purpose of facilitating peer-to-peer learning and faculty mentorship.
              </p>
              <p>
                <strong className={TEXT_COLOR.heading}>3. Authentication & Security:</strong> Authentication is handled through Firebase Auth with strict role permissions. Passwords and credentials are never stored in plain text.
              </p>
              <p>
                <strong className={TEXT_COLOR.heading}>4. No Commercial Sale:</strong> Data is never sold or shared with commercial advertising brokers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPrivacyModalOpen(false)}
              className={`${BUTTON_VARIANTS.primary} w-full`}
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
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-2 ${TEXT_COLOR.accent}`}>
                <FileText className="w-5 h-5" />
                <h3 id="terms-modal-title" className={`${TYPOGRAPHY.h3Card} ${TEXT_COLOR.heading}`}>
                  Terms and Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className={BUTTON_VARIANTS.outline}
                aria-label="Close Terms and Conditions Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className={`${TYPOGRAPHY.body} ${TEXT_COLOR.body} space-y-2`}>
              <p>
                <strong className={TEXT_COLOR.heading}>1. Code of Academic Conduct:</strong> All interactions between students and faculty must uphold academic integrity, respect, and university guidelines.
              </p>
              <p>
                <strong className={TEXT_COLOR.heading}>2. Skill Swaps:</strong> Peer exchanges are voluntary reciprocal commitments. Participants agree to share knowledge fairly without discriminatory behavior.
              </p>
              <p>
                <strong className={TEXT_COLOR.heading}>3. Hardware Exchange Safety:</strong> Electronic components donated or exchanged should be verified for electrical safety before lab implementation.
              </p>
              <p>
                <strong className={TEXT_COLOR.heading}>4. Account Integrity:</strong> Users are prohibited from misrepresenting their academic status or college affiliation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTermsModalOpen(false)}
              className={`${BUTTON_VARIANTS.primary} w-full`}
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
