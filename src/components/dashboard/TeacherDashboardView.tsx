import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School, Sparkles, FolderKanban, Users, Cpu,
  CheckCircle, Clock, Calendar, MessageSquare, ArrowUpRight,
  ShieldCheck, AlertCircle, Send, Plus, BookOpen, ExternalLink
} from 'lucide-react';

interface MentorshipRequest {
  id: string;
  studentName: string;
  studentAvatar: string;
  college: string;
  department: string;
  semester: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'scheduled';
  date: string;
}

export const TeacherDashboardView: React.FC = () => {
  const {
    currentUser,
    projects,
    setActiveTab,
    setSelectedUserProfile,
    users,
    connectionRequests,
    acceptConnectionRequest,
    rejectConnectionRequest,
    openDirectChat,
  } = useApp();

  const [noticeInput, setNoticeInput] = useState('');
  const [notices, setNotices] = useState([
    {
      id: 'n1',
      title: 'ECE Hardware Lab Component Audit',
      content: 'All student teams using STM32 & ESP32 development boards must submit milestone reports by Friday.',
      date: 'Oct 30, 2026'
    },
    {
      id: 'n2',
      title: 'National Hackathon Project Reviews',
      content: 'Faculty office hours are available on Tuesday & Thursday from 3:00 PM to 5:00 PM in Room 204.',
      date: 'Oct 28, 2026'
    }
  ]);

  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const incomingConnectionRequests = connectionRequests.filter(
    (c) => c.receiverUid === currentUser.id && c.status === 'Pending'
  );
  const acceptedConnections = connectionRequests.filter((c) => c.status === 'Accepted');

  const handleAcceptRequest = async (id: string, studentName: string) => {
    await acceptConnectionRequest(id);
    setFeedbackToast(`Connection request from ${studentName} accepted. Direct messaging enabled.`);
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeInput.trim()) return;
    setNotices([
      {
        id: `not_${Date.now()}`,
        title: 'Department Announcement',
        content: noticeInput.trim(),
        date: 'Just now'
      },
      ...notices
    ]);
    setNoticeInput('');
    setFeedbackToast('Department announcement posted to student bulletin.');
    setTimeout(() => setFeedbackToast(null), 4000);
  };

  // Hardware inventory in ECE lab
  const labGear = [
    { name: 'Xilinx Spartan-7 FPGA Kits', available: 8, total: 12, status: 'Active' },
    { name: 'Raspberry Pi 4 Model B (4GB)', available: 14, total: 20, status: 'Active' },
    { name: 'STM32 Nucleo-64 Boards', available: 19, total: 25, status: 'Active' },
    { name: 'Digital Storage Oscilloscopes (100MHz)', available: 4, total: 6, status: 'Lab Restricted' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Faculty Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl shadow-purple-900/10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 mb-3">
            <School className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
            <span>Faculty & Mentor Portal · MANUU ECE</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, Professor {currentUser.name}! 🎓
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-purple-100/90 leading-relaxed">
            {currentUser.designation || 'Faculty Member'} · {currentUser.department || 'Department of Electronics & Communication Engineering'}
            <br />
            Manage student capstone reviews, supervise electronic lab equipment, and guide student research.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className="px-4 py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <FolderKanban className="w-4 h-4 text-purple-700" aria-hidden="true" />
              <span>Review Student Capstones</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>Office Hours & Messages</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {feedbackToast && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Professor Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{acceptedConnections.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Connected Students</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
            <FolderKanban className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{projects.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Published Capstones</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300">
            <Cpu className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">45</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Lab Hardware Units</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{incomingConnectionRequests.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Mentorship Queue & Hardware Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Mentorship & Connection Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Student Connection & Mentorship Requests
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Direct connection requests from students seeking faculty guidance
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                {incomingConnectionRequests.length} Pending
              </span>
            </div>

            {incomingConnectionRequests.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-center space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  No pending student connection requests at the moment.
                </p>
                {users.filter(u => u.id !== currentUser.id && u.role === 'student').length > 0 && (
                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-left space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                      Registered Students in Directory ({users.filter(u => u.id !== currentUser.id && u.role === 'student').length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {users
                        .filter(u => u.id !== currentUser.id && u.role === 'student')
                        .slice(0, 4)
                        .map(student => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => setSelectedUserProfile(student)}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 cursor-pointer hover:border-purple-400 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                          >
                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</h3>
                              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{student.college} • {student.department}</p>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {incomingConnectionRequests.map(req => {
                  const senderProfile = users.find(u => u.id === req.senderUid);
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.senderAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.senderName)}`}
                            alt={req.senderName}
                            className="w-10 h-10 rounded-full object-cover border border-purple-500"
                          />
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                              {senderProfile ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserProfile(senderProfile)}
                                  className="hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                                >
                                  {req.senderName}
                                </button>
                              ) : (
                                req.senderName
                              )}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300">
                              @{req.senderUsername} · {req.senderDepartment} · {req.senderCollege}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Pending</span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id, req.senderName)}
                          className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                        >
                          Accept Connection
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectConnectionRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          Decline
                        </button>
                        {senderProfile && (
                          <button
                            type="button"
                            onClick={() => openDirectChat(senderProfile)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            Message Student
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Student Projects Supervised */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  Supervised Student Projects
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Track progress, milestones, and task completion
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
              >
                <span>View All Projects</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 3).map(proj => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Lead: {proj.authorName} · {proj.college}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {proj.techStack?.slice(0, 3).map(tech => (
                        <span key={tech} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                    proj.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {proj.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lab Hardware Sharing & Announcements */}
        <div className="space-y-6">
          
          {/* ECE Lab Hardware Sharing Section */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-cyan-600 text-white">
                <Cpu className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  ECE Lab Hardware Inventory
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">Student checkout & component reuse</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {labGear.map(item => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</h3>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{item.status}</span>
                  </div>
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    {item.available} / {item.total} available
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Announcements */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Department Bulletin Board
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">Post updates for students in your courses</p>
            </div>

            <form onSubmit={handlePostNotice} className="space-y-2">
              <label htmlFor="teacher-notice-input" className="sr-only">
                Department announcement message
              </label>
              <textarea
                id="teacher-notice-input"
                rows={2}
                placeholder="Post a new announcement or lab schedule..."
                value={noticeInput}
                onChange={e => setNoticeInput(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Publish Announcement</span>
              </button>
            </form>

            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {notices.map(n => (
                <div key={n.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{n.title}</h3>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{n.date}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
