import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  User, Lock, ShieldCheck, Mail, Phone, Building2,
  GraduationCap, School, Sparkles, CheckCircle2,
  AlertCircle, LogOut, ExternalLink, Globe, Github,
  Linkedin, Plus, X, Save
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, setCurrentUser, logout, setActiveTab, emailVerified } = useApp();

  const isTeacher = currentUser.role === 'teacher';

  // Form states initialized with currentUser data
  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || currentUser.phone || '');
  const [college, setCollege] = useState(currentUser.college || currentUser.institution || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [semester, setSemester] = useState(currentUser.semester || 4);
  const [designation, setDesignation] = useState(currentUser.designation || 'Assistant Professor');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [availabilityStatus, setAvailabilityStatus] = useState(currentUser.availabilityStatus || 'Available for Projects');
  const [githubUrl, setGithubUrl] = useState(currentUser.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(currentUser.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(currentUser.portfolioUrl || '');
  const [learningGoals, setLearningGoals] = useState(currentUser.learningGoals || '');

  // Skills state
  const [skillsTeach, setSkillsTeach] = useState<string[]>(
    currentUser.skillsToTeach?.map(s => s.name) || ['Python', 'Embedded Systems']
  );
  const [newTeachSkill, setNewTeachSkill] = useState('');

  const [skillsLearn, setSkillsLearn] = useState<string[]>(
    currentUser.skillsToLearn?.map(s => s.name) || ['React', 'VLSI Design']
  );
  const [newLearnSkill, setNewLearnSkill] = useState('');

  // UI state
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'skills' | 'security' | 'session'>('profile');
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logout modal state
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleAddTeachSkill = () => {
    if (!newTeachSkill.trim() || skillsTeach.includes(newTeachSkill.trim())) return;
    setSkillsTeach([...skillsTeach, newTeachSkill.trim()]);
    setNewTeachSkill('');
  };

  const handleRemoveTeachSkill = (skillName: string) => {
    setSkillsTeach(skillsTeach.filter(s => s !== skillName));
  };

  const handleAddLearnSkill = () => {
    if (!newLearnSkill.trim() || skillsLearn.includes(newLearnSkill.trim())) return;
    setSkillsLearn([...skillsLearn, newLearnSkill.trim()]);
    setNewLearnSkill('');
  };

  const handleRemoveLearnSkill = (skillName: string) => {
    setSkillsLearn(skillsLearn.filter(s => s !== skillName));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.id) return;

    setSaveLoading(true);
    setStatusMessage(null);

    const updatedTeachArray = skillsTeach.map((s, idx) => ({
      id: `sk_t_${idx}`,
      name: s,
      category: 'Technical',
      level: 'Intermediate' as const,
      type: 'teach' as const,
      endorsements: 0
    }));

    const updatedLearnArray = skillsLearn.map((s, idx) => ({
      id: `sk_l_${idx}`,
      name: s,
      category: 'Technical',
      level: 'Beginner' as const,
      type: 'learn' as const,
      endorsements: 0
    }));

    const updatePayload: Record<string, any> = {
      name: name.trim().slice(0, 100),
      username: (username.trim().replace(/[^a-zA-Z0-9_-]/g, '') || currentUser.username || 'user').slice(0, 60),
      bio: bio.trim().slice(0, 500),
      phoneNumber: phoneNumber.trim().slice(0, 25),
      phone: phoneNumber.trim().slice(0, 25),
      college: college.trim().slice(0, 150),
      institution: college.trim().slice(0, 150),
      department: department.trim().slice(0, 100),
      avatar: (avatar.trim() || currentUser.avatar).slice(0, 1000),
      availabilityStatus,
      githubUrl: githubUrl.trim().slice(0, 300),
      linkedinUrl: linkedinUrl.trim().slice(0, 300),
      portfolioUrl: portfolioUrl.trim().slice(0, 300),
      skillsToTeach: updatedTeachArray,
      skillsToLearn: updatedLearnArray,
      updatedAt: new Date().toISOString()
    };

    if (isTeacher) {
      updatePayload.designation = designation.trim().slice(0, 100);
    } else {
      updatePayload.semester = Number(semester) || 4;
      updatePayload.learningGoals = learningGoals.trim().slice(0, 300);
    }

    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, updatePayload);

      setCurrentUser(prev => ({
        ...prev,
        ...updatePayload
      }));

      setStatusMessage({
        type: 'success',
        text: 'Your personal account profile has been saved successfully!'
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update profile. Please verify your connection.'
      });
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    } finally {
      setSaveLoading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      await logout();
      setLogoutModalOpen(false);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Account Overview Header */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatar || currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {currentUser.name}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  @{currentUser.username || 'user'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isTeacher
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {isTeacher ? <School className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  {isTeacher ? 'Teacher / Professor' : 'Student'}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{currentUser.department || 'ECE Department'}</span>
                <span>•</span>
                <span>{currentUser.college || 'MANUU, Hyderabad'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('session')}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-4 overflow-x-auto">
          {[
            { id: 'profile', label: 'Edit Profile', icon: User },
            { id: 'skills', label: 'Skills & Expertise', icon: Sparkles },
            { id: 'security', label: 'Security & Verification', icon: ShieldCheck },
            { id: 'session', label: 'Account Session', icon: Lock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 transition-all ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: Edit Profile Form */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Personal Information</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your persistent account details stored in Firestore.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Unique Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">@</span>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-[10px] text-slate-400 font-normal">(Primary Auth)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private / Secure
                </span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  maxLength={25}
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College / Institution
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={college}
                onChange={e => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
              />
            </div>

            {isTeacher ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Designation
                </label>
                <select
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                >
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                  <option value="Dean / Faculty Advisor">Dean / Faculty Advisor</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={e => setAvailabilityStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
              >
                <option value="Available for Projects">Available for Projects</option>
                <option value="Looking for Hackathon Team">Looking for Hackathon Team</option>
                <option value="Seeking Co-founder">Seeking Co-founder</option>
                <option value="Open for Mentorship">Open for Mentorship</option>
                <option value="Hiring Students">Hiring Students</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Profile Bio
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Tell other students and professors about yourself, your technical interests, and goals..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Avatar Image URL
            </label>
            <input
              type="url"
              maxLength={1000}
              placeholder="https://example.com/photo.jpg"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GitHub URL
              </label>
              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn URL
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={e => setLinkedinUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portfolio / Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://myportfolio.dev"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Skills & Expertise */}
      {activeSubTab === 'skills' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Skills & Knowledge Exchange</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage the skills you can offer to teach and the skills you are interested in learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills to Teach */}
            <div className="p-5 rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Skills You Offer / Teach</h4>
                  <p className="text-[11px] text-slate-500">Skills you can share with peers</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Next.js, Embedded C)"
                  value={newTeachSkill}
                  onChange={e => setNewTeachSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTeachSkill())}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTeachSkill}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 min-h-24">
                {skillsTeach.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeachSkill(s)}
                      className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills to Learn */}
            <div className="p-5 rounded-2xl border border-purple-100 dark:border-purple-950 bg-purple-50/40 dark:bg-purple-950/20 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600 text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Skills You Want to Learn</h4>
                  <p className="text-[11px] text-slate-500">Topics you want guidance on</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. PyTorch, VLSI, Rust)"
                  value={newLearnSkill}
                  onChange={e => setNewLearnSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLearnSkill())}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddLearnSkill}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 min-h-24">
                {skillsLearn.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLearnSkill(s)}
                      className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'Saving...' : 'Update Skills'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Verification */}
      {activeSubTab === 'security' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Security & Authentication</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your Firebase authenticated account credentials.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Email Verification Status</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentUser.email}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                emailVerified
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                <ShieldCheck className="w-4 h-4" />
                <span>{emailVerified ? 'Verified Account' : 'Verification Pending'}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Data Privacy Guarantee</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Your phone number and sensitive contact records are stored securely in Firestore and never exposed publicly.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                ABAC Enforced
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Session & Logout */}
      {activeSubTab === 'session' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Account Session & Logout</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your active session or log out of your SkillSwap AI account.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Signed in as: <span className="text-indigo-600 dark:text-indigo-400">{currentUser.email}</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  UID: <code className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">{currentUser.id}</code>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE 5: Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirm Logout?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Are you sure you want to log out of your account?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={logoutLoading}
                onClick={handleConfirmLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{logoutLoading ? 'Logging out...' : 'Confirm Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
