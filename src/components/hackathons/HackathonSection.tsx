import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Calendar, MapPin, Users } from 'lucide-react';

// Issue 1: Standardized Hackathon button variants (4 reusable variants <= 5 maximum)
export const HACKATHON_BUTTON_VARIANTS = {
  primary:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
  secondary:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
  outline:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
  subtle:
    'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white hover:bg-amber-50 text-amber-800 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 whitespace-nowrap',
} as const;

export const HackathonSection: React.FC = () => {
  const { hackathons, registerForHackathon, setActiveTab } = useApp();

  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);

  return (
    <div className="space-y-6" data-selected-hackathon={selectedHackathonId ?? undefined}>
      {/* Issue 4: Promotional Banner with aligned left vertical axis for badge, H1 heading, and description */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col items-start text-left gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 text-white text-xs font-semibold self-start m-0">
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>National & Global Student Hackathons</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-left m-0">
            Compete, Win Cash Prizes & Get Incubated
          </h1>
          <p className="text-xs text-amber-100/90 max-w-xl text-left m-0 leading-relaxed">
            Register for top collegiate hackathons, auto-assemble complementary teams with SkillSwap AI, and track deadline milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('ai-team')}
          className={HACKATHON_BUTTON_VARIANTS.subtle}
        >
          Form Hackathon Team
        </button>
      </div>

      {/* Hackathons Cards List */}
      <div className="space-y-6">
        {hackathons.map((hackathon) => (
          <div
            key={hackathon.id}
            onClick={() => setSelectedHackathonId(hackathon.id)}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            {/* Banner & Image */}
            <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
              <img
                src={hackathon.banner}
                alt={hackathon.title}
                className="w-full sm:w-44 h-32 rounded-2xl object-cover shrink-0"
              />
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Issue 2: Prize Pool badge increased from 10px to 12px (text-xs) with high-contrast amber styling */}
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Prize Pool: {hackathon.prizePool}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ● {hackathon.mode}
                  </span>
                </div>

                {/* Issue 3: Semantic H2 heading (fixing H1 -> H3 skipped heading level) while preserving visual typography */}
                <h2 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  {hackathon.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Organized by: {hackathon.organizer}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {hackathon.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {hackathon.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Info & Balanced Action Buttons (Issue 5) */}
            <div className="w-full lg:w-auto lg:min-w-[320px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3.5 shrink-0">
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {hackathon.startDate} – {hackathon.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{hackathon.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{hackathon.registeredStudentsCount} Registered Students</span>
                </div>
              </div>

              {/* Issue 5: Balanced side-by-side layout on sm+ screens, stacked on narrow mobile, >= 44px touch targets */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    registerForHackathon(hackathon.id);
                  }}
                  aria-pressed={hackathon.isRegistered}
                  className={`${
                    hackathon.isRegistered
                      ? HACKATHON_BUTTON_VARIANTS.secondary
                      : HACKATHON_BUTTON_VARIANTS.primary
                  } w-full sm:w-auto`}
                >
                  {hackathon.isRegistered ? '✓ Registered' : 'Register Now'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('ai-team');
                  }}
                  className={`${HACKATHON_BUTTON_VARIANTS.outline} w-full sm:w-auto`}
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

