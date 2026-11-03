import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import { UserSkill } from '../../types';
import {
  X,
  GraduationCap,
  School,
  Github,
  Linkedin,
  Globe,
  ShieldCheck,
  Award,
  Star,
  Send,
  ArrowLeftRight,
  Check,
  Plus,
  Settings,
  BookOpen,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    selectedUserProfile,
    setSelectedUserProfile,
    currentUser,
    setCurrentUser,
    sendSwapRequest,
    connectionRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    cancelConnectionRequest,
    removeConnection,
    openDirectChat,
    setActiveTab,
    setUsers,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [editedAvailability, setEditedAvailability] = useState(
    selectedUserProfile?.availabilityStatus || currentUser.availabilityStatus
  );
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory] = useState('Web Dev');
  const [newSkillType, setNewSkillType] = useState<'teach' | 'learn'>('teach');
  const [savingProfile, setSavingProfile] = useState(false);

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapTeachSkill, setSwapTeachSkill] = useState('');
  const [swapLearnSkill, setSwapLearnSkill] = useState('');
  const [swapMessage, setSwapMessage] = useState('');
  const [swapSuccess, setSwapSuccess] = useState(false);

  useEffect(() => {
    if (!selectedUserProfile) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (swapModalOpen) {
          setSwapModalOpen(false);
        } else {
          setSelectedUserProfile(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedUserProfile, swapModalOpen, setSelectedUserProfile]);

  if (!selectedUserProfile) return null;

  const isSelf = selectedUserProfile.id === currentUser.id;
  const profileData = isSelf ? currentUser : selectedUserProfile;
  const isTeacher = profileData.role === 'teacher';

  // Connection state between currentUser and profileData
  const existingConnection = connectionRequests.find(
    (c) =>
      (c.senderUid === currentUser.id && c.receiverUid === profileData.id) ||
      (c.senderUid === profileData.id && c.receiverUid === currentUser.id)
  );

  const handleSaveProfile = async () => {
    const nextBio = editedBio.trim() || currentUser.bio;
    const nextAvailability = (editedAvailability || currentUser.availabilityStatus) as any;

    setSavingProfile(true);
    try {
      if (currentUser.id) {
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(userRef, {
          bio: nextBio.slice(0, 500),
          availabilityStatus: nextAvailability,
          updatedAt: new Date().toISOString(),
        });
      }

      const updatedProfile = {
        ...currentUser,
        bio: nextBio,
        availabilityStatus: nextAvailability,
      };
      setCurrentUser(updatedProfile);
      setSelectedUserProfile(updatedProfile);
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? updatedProfile : u))
      );
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    const newSkill: UserSkill = {
      id: `s_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: 'Intermediate',
      type: newSkillType,
      endorsements: 1,
    };

    const nextTeach =
      newSkillType === 'teach'
        ? [...currentUser.skillsToTeach, newSkill]
        : currentUser.skillsToTeach;
    const nextLearn =
      newSkillType === 'learn'
        ? [...currentUser.skillsToLearn, newSkill]
        : currentUser.skillsToLearn;

    setNewSkillName('');

    const updatedProfile = {
      ...currentUser,
      skillsToTeach: nextTeach,
      skillsToLearn: nextLearn,
    };
    setCurrentUser(updatedProfile);
    setSelectedUserProfile(updatedProfile);
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? updatedProfile : u))
    );

    if (currentUser.id) {
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          skillsToTeach: nextTeach,
          skillsToLearn: nextLearn,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`);
      }
    }
  };

  const handleSendSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendSwapRequest(profileData.id, swapTeachSkill, swapLearnSkill, swapMessage);
    setSwapSuccess(true);
    setTimeout(() => {
      setSwapSuccess(false);
      setSwapModalOpen(false);
    }, 1200);
  };

  const handleStartDirectMessage = async () => {
    setSelectedUserProfile(null);
    await openDirectChat(profileData);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto overflow-x-hidden overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedUserProfile(null);
        }
      }}
    >
      <div className="min-h-full w-full flex items-start justify-center p-3 sm:p-6 md:py-10">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden mb-16 md:mb-8">
          
          {/* Top Gradient Cover Banner */}
          <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
            <button
              type="button"
              onClick={() => setSelectedUserProfile(null)}
              aria-label="Close profile dialog"
              className="absolute top-4 right-4 bg-slate-900/50 hover:bg-slate-900/80 text-white p-2 rounded-full backdrop-blur-md transition-colors z-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Profile Body Container */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8">
            
            {/* Row 1: Avatar overlapping cover edge + Action Buttons below cover */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="-mt-12 sm:-mt-14 shrink-0">
                <img
                  src={
                    profileData.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}`
                  }
                  alt={profileData.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-xl bg-white dark:bg-slate-800"
                />
              </div>

              {/* Action Buttons (always cleanly below the gradient banner) */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-3">
                {isSelf ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedBio(profileData.bio || '');
                        setEditedAvailability(
                          profileData.availabilityStatus || 'Available for Projects'
                        );
                        setIsEditing(!isEditing);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUserProfile(null);
                        setActiveTab('settings');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Full Settings</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Connection Status Control */}
                    {!existingConnection || existingConnection.status === 'Rejected' ? (
                      <button
                        type="button"
                        onClick={() => sendConnectionRequest(profileData)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Connect</span>
                      </button>
                    ) : existingConnection.status === 'Pending' &&
                      existingConnection.senderUid === currentUser.id ? (
                      <button
                        type="button"
                        onClick={() => cancelConnectionRequest(existingConnection.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        title="Click to cancel connection request"
                      >
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Request Sent (Cancel)</span>
                      </button>
                    ) : existingConnection.status === 'Pending' &&
                      existingConnection.receiverUid === currentUser.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => acceptConnectionRequest(existingConnection.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Accept</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectConnectionRequest(existingConnection.id)}
                          aria-label={`Reject connection request from ${profileData.name}`}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <UserX className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeConnection(profileData.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        title="Click to remove connection"
                      >
                        <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Connected</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSwapTeachSkill(currentUser.skillsToTeach[0]?.name || 'Python');
                        setSwapLearnSkill(profileData.skillsToTeach[0]?.name || 'Embedded Systems');
                        setSwapModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Swap Skill</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartDirectMessage}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Message</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Name, @username, Role Badge, Institution, and Department */}
            <div className="mt-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="profile-modal-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 break-words">
                  {profileData.name}
                </h2>
                {profileData.verificationStatus === 'verified' && (
                  <span
                    className="p-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 shrink-0"
                    title="Verified Account"
                    aria-label="Verified Account"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  </span>
                )}
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    isTeacher
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}
                >
                  {isTeacher ? (
                    <School className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <GraduationCap className="w-3 h-3" aria-hidden="true" />
                  )}
                  <span>{isTeacher ? 'Teacher / Professor' : 'Student'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 dark:text-slate-300">
                <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                  @{profileData.username || profileData.id.slice(0, 8)}
                </span>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200 break-words">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                  {profileData.college || profileData.institution || 'MANUU, Hyderabad'}
                  {profileData.department ? ` • ${profileData.department}` : ''}
                </span>
              </div>

              {isTeacher && profileData.designation ? (
                <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                  {profileData.designation}
                </p>
              ) : !isTeacher && profileData.semester ? (
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                  Semester {profileData.semester}
                  {profileData.course ? ` • ${profileData.course}` : ''}
                </p>
              ) : null}
            </div>

            {/* Inline Edit Bio Form if self editing */}
            {isEditing && (
              <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Update Profile Details
                </h3>
                <div>
                  <label htmlFor="profile-edit-bio" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="profile-edit-bio"
                    rows={3}
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="profile-edit-availability" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Availability Status
                  </label>
                  <select
                    id="profile-edit-availability"
                    value={editedAvailability}
                    onChange={(e) => setEditedAvailability(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                  >
                    <option value="Available for Projects">Available for Projects</option>
                    <option value="Looking for Hackathon Team">Looking for Hackathon Team</option>
                    <option value="Seeking Co-founder">Seeking Co-founder</option>
                    <option value="Open for Mentorship">Open for Mentorship</option>
                  </select>
                </div>
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Main Profile Content Sections */}
            <div className="space-y-6">
              
              {/* Bio & Availability Status */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    About
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ● {profileData.availabilityStatus || 'Available for Projects'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words">
                  {profileData.bio || 'Passionate member of the SkillSwap AI academic community.'}
                </p>
              </div>

              {/* Teacher Subjects & Expertise (if teacher) */}
              {isTeacher &&
                profileData.subjectsAndExpertise &&
                profileData.subjectsAndExpertise.length > 0 && (
                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
                    <h3 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Academic Subjects & Areas of Expertise</span>
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.subjectsAndExpertise.map((subj, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Skills to Teach & Learn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center justify-between">
                    <span>Can Teach / Mentor</span>
                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                      {profileData.skillsToTeach?.length || 0} skills
                    </span>
                  </h3>
                  {(profileData.skillsToTeach?.length || 0) === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic py-2">
                      No teaching skills listed yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {profileData.skillsToTeach.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-2 text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <span className="font-semibold text-indigo-700 dark:text-indigo-300 break-words">
                            {s.name}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 shrink-0">{s.level}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2.5 flex items-center justify-between">
                    <span>Wants to Learn</span>
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                      {profileData.skillsToLearn?.length || 0} skills
                    </span>
                  </h3>
                  {(profileData.skillsToLearn?.length || 0) === 0 ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic py-2">
                      No learning goals listed yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {profileData.skillsToLearn.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between gap-2 text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                        >
                          <span className="font-semibold text-purple-700 dark:text-purple-300 break-words">
                            {s.name}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 shrink-0">{s.level}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Add Skill controls if viewing own profile */}
              {isSelf && (
                <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Add New Skill
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="profile-new-skill-name" className="sr-only">
                      New skill name
                    </label>
                    <input
                      id="profile-new-skill-name"
                      type="text"
                      placeholder="e.g. PyTorch, Figma, Next.js, Embedded C"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 min-w-[160px] px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <label htmlFor="profile-new-skill-type" className="sr-only">
                      Skill category type
                    </label>
                    <select
                      id="profile-new-skill-type"
                      value={newSkillType}
                      onChange={(e) => setNewSkillType(e.target.value as any)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    >
                      <option value="teach">Can Teach</option>
                      <option value="learn">Wants to Learn</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Interests */}
              {profileData.interests && profileData.interests.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                    Interests & Focus Areas
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profileData.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates (if any) */}
              {profileData.certificates && profileData.certificates.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                    Certifications & Achievements
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {profileData.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start gap-2.5"
                      >
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 break-words">
                            {cert.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {cert.issuer} • {cert.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Peer Rating
                  </span>
                  <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" aria-hidden="true" />
                    <span>{profileData.rating || 5.0}</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">
                      ({profileData.reviewCount || 0} swap reviews)
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Badges
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(profileData.badges && profileData.badges.length > 0
                      ? profileData.badges
                      : [isTeacher ? 'Faculty Mentor 🎓' : 'Campus Member 🎓']
                    ).map((badge, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* External Links */}
              {(profileData.githubUrl || profileData.linkedinUrl || profileData.portfolioUrl) && (
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {profileData.githubUrl && (
                    <a
                      href={profileData.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Github className="w-4 h-4" aria-hidden="true" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profileData.linkedinUrl && (
                    <a
                      href={profileData.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Linkedin className="w-4 h-4" aria-hidden="true" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profileData.portfolioUrl && (
                    <a
                      href={profileData.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <Globe className="w-4 h-4" aria-hidden="true" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Swap Modal Popup */}
          {swapModalOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-swap-modal-title"
              className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setSwapModalOpen(false);
              }}
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 relative shadow-2xl my-auto">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  aria-label="Close skill swap modal"
                  className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 p-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
                <h3 id="profile-swap-modal-title" className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                  Skill Swap with {profileData.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-4">Propose a skill exchange session!</p>

                {swapSuccess ? (
                  <div role="status" aria-live="polite" className="py-6 text-center text-emerald-700 dark:text-emerald-300 font-semibold space-y-2">
                    <Check className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" aria-hidden="true" />
                    <p>Swap Request Sent!</p>
                  </div>
                ) : (
                  <form onSubmit={handleSendSwapSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="profile-swap-teach-skill" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        I will teach:
                      </label>
                      <input
                        id="profile-swap-teach-skill"
                        type="text"
                        required
                        value={swapTeachSkill}
                        onChange={(e) => setSwapTeachSkill(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-swap-learn-skill" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        In exchange for learning:
                      </label>
                      <input
                        id="profile-swap-learn-skill"
                        type="text"
                        required
                        value={swapLearnSkill}
                        onChange={(e) => setSwapLearnSkill(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-swap-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Note / Availability Message:
                      </label>
                      <textarea
                        id="profile-swap-message"
                        rows={2}
                        placeholder="Hi! Free this weekend for a 1-hour session on Google Meet?"
                        value={swapMessage}
                        onChange={(e) => setSwapMessage(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      Send Swap Invitation
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
