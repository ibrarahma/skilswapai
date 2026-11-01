import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Calendar, MapPin, Users, Award, Clock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const HackathonSection: React.FC = () => {
  const { hackathons, registerForHackathon, setActiveTab } = useApp();

  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>National & Global Student Hackathons</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Compete, Win Cash Prizes & Get Incubated
          </h1>
          <p className="text-xs text-amber-100/90 mt-1 max-w-xl">
            Register for top collegiate hackathons, auto-assemble complementary teams with SkillSwap AI, and track deadline milestones.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('ai-team')}
          className="px-4 py-2.5 rounded-xl bg-white text-amber-800 text-xs font-bold shadow-lg hover:bg-slate-100 transition-all shrink-0"
        >
          Form Hackathon Team
        </button>
      </div>

      {/* Hackathons Cards List */}
      <div className="space-y-6">
        {hackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            {/* Banner & Image */}
            <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
              <img
                src={hackathon.banner}
                alt={hackathon.title}
                className="w-full sm:w-44 h-32 rounded-2xl object-cover shrink-0"
              />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Prize Pool: {hackathon.prizePool}
                  </span>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ● {hackathon.mode}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {hackathon.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Organized by: {hackathon.organizer}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {hackathon.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hackathon.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Info & Action */}
            <div className="w-full lg:w-64 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3 shrink-0">
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>{hackathon.startDate} – {hackathon.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>{hackathon.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>{hackathon.registeredStudentsCount} Registered Students</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => registerForHackathon(hackathon.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    hackathon.isRegistered
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {hackathon.isRegistered ? '✓ Registered (View Details)' : 'Register Now'}
                </button>

                <button
                  onClick={() => setActiveTab('ai-team')}
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Find Hackathon Teammates
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
