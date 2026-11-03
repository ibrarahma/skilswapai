import React, { useState, useEffect } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileView } from './components/profile/ProfileView';

import { PublicHomePage } from './components/home/PublicHomePage';
import { DashboardView } from './components/dashboard/DashboardView';
import { TeacherDashboardView } from './components/dashboard/TeacherDashboardView';
import { SettingsView } from './components/settings/SettingsView';
import { SkillsExchange } from './components/skills/SkillsExchange';
import { AITeamFinder } from './components/team/AITeamFinder';
import { ProjectHub } from './components/projects/ProjectHub';
import { HackathonSection } from './components/hackathons/HackathonSection';
import { StartupHub } from './components/startups/StartupHub';
import { CommunityForum } from './components/community/CommunityForum';
import { AICareerSuite } from './components/ai/AICareerSuite';
import { ChatView } from './components/chat/ChatView';
import { AdminPanel } from './components/admin/AdminPanel';
import { Sparkles, X } from 'lucide-react';

export function App() {
  const {
    activeTab,
    selectedUserProfile,
    authModalOpen,
    isAuthenticated,
    authLoading,
    emailVerified,
    currentUser,
  } = useApp();

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [verifiedReloaded, setVerifiedReloaded] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer for resend email verification
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResendLink = async () => {
    if (!auth.currentUser || resendLoading || resendCooldown > 0) return;
    setResendLoading(true);
    setResendStatusMsg(null);

    try {
      await sendEmailVerification(auth.currentUser);
      setResendStatusMsg('Verification email sent! Check your inbox and spam folder.');
      setResendCooldown(60);
    } catch (err: any) {
      if (err?.code === 'auth/too-many-requests' || err?.message?.includes('too-many-requests')) {
        setResendStatusMsg('Too many requests. Please wait a minute before requesting another link.');
        setResendCooldown(60);
      } else {
        setResendStatusMsg('Could not send verification email. Please try again later.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerified = async () => {
    if (!auth.currentUser) return;
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setVerifiedReloaded(true);
        setResendStatusMsg(null);
      } else {
        setResendStatusMsg('Email not verified yet. Please click the link in your inbox first.');
      }
    } catch {
      setResendStatusMsg('Unable to refresh verification status right now.');
    }
  };

  if (authLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading application"
        className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
      >
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading SkillSwap AI...</span>
      </div>
    );
  }

  // Stage 1: Public Home Page rendered for all visitors before authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <PublicHomePage />
        {authModalOpen && <AuthModal />}
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentUser.role === 'teacher' ? <TeacherDashboardView /> : <DashboardView />;
      case 'settings':
        return <SettingsView />;
      case 'skills':
        return <SkillsExchange />;
      case 'ai-team':
        return <AITeamFinder />;
      case 'projects':
        return <ProjectHub />;
      case 'hackathons':
        return <HackathonSection />;
      case 'startups':
        return <StartupHub />;
      case 'community':
        return <CommunityForum />;
      case 'ai-career':
        return <AICareerSuite />;
      case 'chat':
        return <ChatView />;
      case 'admin':
        return <AdminPanel />;
      default:
        return currentUser.role === 'teacher' ? <TeacherDashboardView /> : <DashboardView />;
    }
  };

  const showVerifyBanner = !emailVerified && !verifiedReloaded && !bannerDismissed;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 overflow-x-hidden">
      {/* Skip to Main Content Link for Keyboard & Screen Reader Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-indigo-600 focus:text-white focus:font-bold focus:text-sm focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {showVerifyBanner && (
        <div
          role="region"
          aria-label="Email verification notice"
          className="w-full bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/60 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span>Please verify your email address. Check your inbox and spam folder.</span>
              {resendStatusMsg && (
                <span
                  role="status"
                  aria-live="polite"
                  className="inline-block px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/80 font-medium text-xs text-amber-950 dark:text-amber-100"
                >
                  {resendStatusMsg}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResendLink}
                disabled={resendLoading || resendCooldown > 0}
                className="px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900/80 hover:bg-amber-300/80 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend link'}
              </button>
              <button
                type="button"
                onClick={handleCheckVerified}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                I verified
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 rounded-lg text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Dismiss verification banner"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Fixed Header */}
      <Navbar />

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Collapsible / Responsive Navigation Sidebar */}
          <Sidebar />

          {/* Core Content Viewstage */}
          <main id="main-content" tabIndex={-1} className="flex-1 w-full min-w-0 focus:outline-none">
            {renderActiveTab()}
          </main>

        </div>
      </div>

      {/* Global Modals */}
      {selectedUserProfile && <ProfileView />}
      {authModalOpen && <AuthModal />}

    </div>
  );
}

export default App;
