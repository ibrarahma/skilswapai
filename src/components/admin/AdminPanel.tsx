import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck, Users, GraduationCap, CheckCircle2, XCircle,
  BarChart3, FileText, AlertTriangle, ArrowUpRight
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { users, setUsers } = useApp();

  const handleApproveVerification = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: 'verified' } : u));
  };

  const handleRejectVerification = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, verificationStatus: 'unverified' } : u));
  };

  const pendingVerifications = users.filter(u => u.verificationStatus === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>College Administration & Moderation Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Campus Analytics & Student Identity Verification
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Review student college ID verifications, monitor campus skill exchange activity, and manage college moderation policies.
          </p>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled Students</span>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{users.length + 1420}</div>
          <p className="text-[10px] text-emerald-600 font-semibold">↑ 12% growth this semester</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Skill Swaps Completed</span>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">3,840 hrs</div>
          <p className="text-[10px] text-indigo-600 font-semibold">Peer peer mentoring</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified Badges Issued</span>
          <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100">892</div>
          <p className="text-[10px] text-purple-600 font-semibold">IIT & NIT certified</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pending Identity Checks</span>
          <div className="text-xl font-extrabold text-amber-600">{pendingVerifications.length}</div>
          <p className="text-[10px] text-slate-400">Requires Admin action</p>
        </div>
      </div>

      {/* Pending Verifications Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Student College ID Verification Queue</span>
        </h3>

        {pendingVerifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            All student verification requests are currently cleared!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase text-slate-400">
                <tr>
                  <th className="p-3 rounded-l-xl">Student</th>
                  <th className="p-3">College & Department</th>
                  <th className="p-3">Semester</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pendingVerifications.map((student) => (
                  <tr key={student.id}>
                    <td className="p-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                      <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{student.name}</span>
                    </td>
                    <td className="p-3">{student.college} • {student.department}</td>
                    <td className="p-3">{student.semester} Semester</td>
                    <td className="p-3 font-semibold text-amber-600">Pending Verification</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleApproveVerification(student.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] shadow-sm hover:bg-emerald-700 transition-all"
                      >
                        Approve ID
                      </button>
                      <button
                        onClick={() => handleRejectVerification(student.id)}
                        className="px-3 py-1 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold text-[11px] hover:bg-rose-200 transition-all"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
