import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  X, Mail, Lock, ArrowRight, Sparkles, CheckCircle2, AlertCircle,
  GraduationCap, School, Phone, BookOpen
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, authMode, setAuthMode } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('4');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [skillsTeachInput, setSkillsTeachInput] = useState('');
  const [skillsLearnInput, setSkillsLearnInput] = useState('');
  const [expertiseInput, setExpertiseInput] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!authModalOpen) return null;

  const ensureUserDocument = async (
    uid: string,
    userEmail: string,
    displayName: string,
    role: 'student' | 'teacher',
    userCollege: string,
    photoURL: string,
    extraFields?: {
      department?: string;
      semester?: number;
      designation?: string;
      skillsToTeach?: string[];
      skillsToLearn?: string[];
      subjectsAndExpertise?: string[];
      phoneNumber?: string;
    }
  ) => {
    const userPath = `users/${uid}`;
    const userRef = doc(db, 'users', uid);
    let exists = false;
    try {
      const snap = await getDoc(userRef);
      exists = snap.exists();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, userPath);
    }

    if (!exists) {
      const safeName = (displayName || userEmail.split('@')[0] || 'Member').slice(0, 100);
      const safeUsername = (
        userEmail.split('@')[0]?.replace(/[^a-zA-Z0-9_-]/g, '') || `user_${uid.slice(0, 6)}`
      ).slice(0, 60);
      const safeEmail = (userEmail || 'user@example.com').slice(0, 254);
      const safeCollege = (userCollege || 'Maulana Azad National Urdu University').slice(0, 150);
      const safeAvatar = (
        photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}`
      ).slice(0, 1000);

      const teachSkillsArray = (extraFields?.skillsToTeach || []).map((s, idx) => ({
        id: `sk_t_${idx}_${Date.now()}`,
        name: s.trim(),
        category: 'Technical',
        level: 'Intermediate' as const,
        type: 'teach' as const,
        endorsements: 0
      }));

      const learnSkillsArray = (extraFields?.skillsToLearn || []).map((s, idx) => ({
        id: `sk_l_${idx}_${Date.now()}`,
        name: s.trim(),
        category: 'Technical',
        level: 'Beginner' as const,
        type: 'learn' as const,
        endorsements: 0
      }));

      try {
        await setDoc(userRef, {
          name: safeName,
          username: safeUsername,
          email: safeEmail,
          role: role === 'teacher' ? 'teacher' : 'student',
          college: safeCollege,
          institution: safeCollege,
          department: (extraFields?.department || (role === 'teacher' ? 'Electronics and Communication Engineering' : 'ECE')).slice(0, 100),
          semester: role === 'student' ? (extraFields?.semester || 4) : 0,
          designation: role === 'teacher' ? (extraFields?.designation || 'Assistant Professor').slice(0, 100) : '',
          subjectsAndExpertise: extraFields?.subjectsAndExpertise || (role === 'teacher' ? ['Embedded Systems', 'IoT'] : []),
          phoneNumber: (extraFields?.phoneNumber || '').slice(0, 25),
          phone: (extraFields?.phoneNumber || '').slice(0, 25),
          bio: role === 'teacher'
            ? `Faculty member in ${extraFields?.department || 'ECE'} specializing in academic instruction and research supervision.`
            : `Student passionate about skill exchange, project collaboration, and peer learning.`,
          avatar: safeAvatar,
          skillsToTeach: teachSkillsArray,
          skillsToLearn: learnSkillsArray,
          interests: role === 'teacher' ? ['Research Guidance', 'Hardware Labs'] : ['Hackathons', 'Project Teams', 'Web Development'],
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, userPath);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await ensureUserDocument(
        cred.user.uid,
        cred.user.email || '',
        cred.user.displayName || '',
        selectedRole,
        college || 'Maulana Azad National Urdu University',
        cred.user.photoURL || '',
        {
          department: department || 'Electronics and Communication Engineering',
          semester: Number(semester) || 4,
          designation,
          phoneNumber
        }
      );
      setAuthModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('token-service-api-has-not-been-used') || msg.includes('securetoken.googleapis.com')) {
        setErrorMsg('Google Cloud Token Service API (securetoken.googleapis.com) is not enabled on project 229987837427. Please enable it in the Google Cloud Console.');
      } else {
        setErrorMsg(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMsg('Password reset email sent! Check your inbox.');
        setLoading(false);
        return;
      }

      if (authMode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        const teachList = skillsTeachInput
          ? skillsTeachInput.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        const learnList = skillsLearnInput
          ? skillsLearnInput.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        const expertiseList = expertiseInput
          ? expertiseInput.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        await ensureUserDocument(
          cred.user.uid,
          email.trim(),
          name.trim(),
          selectedRole,
          college.trim() || 'Maulana Azad National Urdu University',
          '',
          {
            department: department.trim() || (selectedRole === 'teacher' ? 'Electronics and Communication Engineering' : 'ECE'),
            semester: selectedRole === 'student' ? Number(semester) || 4 : 0,
            designation: selectedRole === 'teacher' ? designation : '',
            skillsToTeach: teachList,
            skillsToLearn: learnList,
            subjectsAndExpertise: expertiseList,
            phoneNumber: phoneNumber.trim()
          }
        );

        try {
          await sendEmailVerification(cred.user);
        } catch {
          // Non-fatal if verification email rate-limited
        }
        setAuthModalOpen(false);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await ensureUserDocument(
          cred.user.uid,
          cred.user.email || email.trim(),
          cred.user.displayName || email.split('@')[0],
          'student',
          'Maulana Azad National Urdu University',
          cred.user.photoURL || ''
        );
        setAuthModalOpen(false);
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('token-service-api-has-not-been-used') || msg.includes('securetoken.googleapis.com')) {
        setErrorMsg('Google Cloud Token Service API (securetoken.googleapis.com) is not enabled on project 229987837427. Please enable it in the Google Cloud Console.');
      } else {
        setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full border border-slate-200 dark:border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 mx-auto flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {authMode === 'login' && 'Welcome Back to SkillSwap AI'}
            {authMode === 'register' && 'Create Your Account'}
            {authMode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect, swap skills, and build AI projects with students across top colleges.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col gap-1.5 text-xs text-rose-600 dark:text-rose-400">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.includes('securetoken.googleapis.com') && (
              <a
                href="https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?project=229987837427"
                target="_blank"
                rel="noreferrer"
                className="ml-6 text-[11px] underline font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                Click here to open Google Cloud Console and enable Token Service API →
              </a>
            )}
          </div>
        )}

        {successMsg ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center text-emerald-600 dark:text-emerald-400 font-semibold space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="text-xs">{successMsg}</p>
            <button
              type="button"
              onClick={() => {
                setSuccessMsg('');
                setAuthMode('login');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {/* Social Google Login Button */}
            {(authMode === 'login' || authMode === 'register') && (
              <div className="mb-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google Account</span>
                </button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-slate-400">
                    <span className="bg-white dark:bg-slate-900 px-2">or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {authMode === 'register' && (
                <>
                  {/* Role Selection Switcher */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Your Role <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedRole === 'student'
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded-lg ${selectedRole === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">Student</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          Learn skills, build projects & find teams
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('teacher')}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          selectedRole === 'teacher'
                            ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/30'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded-lg ${selectedRole === 'teacher' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            <School className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold">Teacher / Prof</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          Mentor students & supervise projects
                        </p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder={selectedRole === 'teacher' ? 'e.g. Dr. Syed Khaja' : 'e.g. Aarav Sharma'}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">College / University</label>
                      <input
                        type="text"
                        required
                        maxLength={150}
                        placeholder="e.g. MANUU Hyderabad"
                        value={college}
                        onChange={e => setCollege(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        placeholder="e.g. ECE / School of Tech"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                      />
                    </div>
                  </div>

                  {selectedRole === 'student' ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester / Year</label>
                          <select
                            value={semester}
                            onChange={e => setSemester(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          >
                            <option value="1">Semester 1 (1st Year)</option>
                            <option value="2">Semester 2 (1st Year)</option>
                            <option value="3">Semester 3 (2nd Year)</option>
                            <option value="4">Semester 4 (2nd Year)</option>
                            <option value="5">Semester 5 (3rd Year)</option>
                            <option value="6">Semester 6 (3rd Year)</option>
                            <option value="7">Semester 7 (4th Year)</option>
                            <option value="8">Semester 8 (4th Year)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number (Private)</label>
                          <input
                            type="tel"
                            maxLength={25}
                            placeholder="+91 98765 43210"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills to Teach</label>
                          <input
                            type="text"
                            placeholder="e.g. Python, C++, Figma"
                            value={skillsTeachInput}
                            onChange={e => setSkillsTeachInput(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills to Learn</label>
                          <input
                            type="text"
                            placeholder="e.g. React, Embedded C, AI"
                            value={skillsLearnInput}
                            onChange={e => setSkillsLearnInput(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Designation</label>
                          <select
                            value={designation}
                            onChange={e => setDesignation(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          >
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Professor">Professor</option>
                            <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                            <option value="Dean / Faculty Advisor">Dean / Faculty Advisor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Office / Phone (Private)</label>
                          <input
                            type="tel"
                            maxLength={25}
                            placeholder="+91 98765 43210"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subjects & Areas of Expertise</label>
                        <input
                          type="text"
                          placeholder="e.g. Digital Signal Processing, VLSI, Embedded IoT, Machine Learning"
                          value={expertiseInput}
                          onChange={e => setExpertiseInput(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    maxLength={254}
                    placeholder="student@college.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                  />
                </div>
              </div>

              {authMode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 outline-none"
                    />
                  </div>
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex items-center justify-end text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-slate-500 dark:text-slate-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : authMode === 'login'
                    ? 'Sign In'
                    : authMode === 'register'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
              {authMode === 'login' ? (
                <p>
                  Don't have a profile yet?{' '}
                  <button onClick={() => setAuthMode('register')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
