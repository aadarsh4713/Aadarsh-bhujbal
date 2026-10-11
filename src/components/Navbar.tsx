import React from 'react';
import { Dumbbell, Activity, Flame, Bot, LogIn, LogOut, User, Sparkles } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const {
    activeWorkout,
    workoutDurationSeconds,
    currentUser,
    isAuthLoading,
    signInWithGoogle,
    logout,
    settings,
  } = useFitness();

  const minutes = Math.floor(workoutDurationSeconds / 60);
  const seconds = workoutDurationSeconds % 60;
  const liveTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const themeDisplayNames: Record<string, string> = {
    lime: 'Electric Lime',
    gold: 'Royal Gold',
    crimson: 'Crimson Velvet',
    emerald: 'Midnight Emerald',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0a0d12]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setCurrentTab('workouts')}
          className="flex items-center gap-2.5 text-left cursor-pointer whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <div className="w-8 h-8 rounded-lg bg-brand text-black flex items-center justify-center font-black shadow-md shadow-brand/20">
            <Dumbbell className="w-4 h-4 fill-black stroke-black" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-white font-['Barlow_Condensed'] uppercase">
            Apex<span className="text-brand">Fit</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Single-line) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setCurrentTab('workouts')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'workouts' ? 'text-white font-bold border-b-2 border-brand' : 'hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('routines')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'routines' ? 'text-white font-bold border-b-2 border-brand' : 'hover:text-slate-200'
            }`}
          >
            Splits & Programs
          </button>
          <button
            onClick={() => setCurrentTab('exercises')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'exercises' ? 'text-white font-bold border-b-2 border-brand' : 'hover:text-slate-200'
            }`}
          >
            Catalog ({90}+)
          </button>
          <button
            onClick={() => setCurrentTab('lab')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'lab' ? 'text-white font-bold border-b-2 border-brand' : 'hover:text-slate-200'
            }`}
          >
            Plate & 1RM Lab
          </button>
          <button
            onClick={() => setCurrentTab('coach')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentTab === 'coach' ? 'text-brand font-bold border-b-2 border-brand' : 'hover:text-slate-200 text-brand/90'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-brand" />
            <span>AI Coach</span>
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'history' ? 'text-white font-bold border-b-2 border-brand' : 'hover:text-slate-200'
            }`}
          >
            Records
          </button>
          <button
            onClick={() => setCurrentTab('profile')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              currentTab === 'profile' ? 'text-white font-bold border-b-2 border-brand' : 'hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-brand" />
            <span>Profile & Themes</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Auth controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Profile & Theme Badge Trigger */}
          <button
            onClick={() => setCurrentTab('profile')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition cursor-pointer text-xs ${
              currentTab === 'profile'
                ? 'bg-[#18202e] border-brand text-brand ring-1 ring-brand'
                : 'bg-[#121721] border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
            title="Open Athlete Profile & Luxury Themes"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-brand shadow-sm shadow-brand/50 shrink-0" />
            <span className="font-semibold hidden sm:inline max-w-[100px] truncate">
              {settings.athleteProfile?.displayName || 'Profile'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
              ({themeDisplayNames[settings.theme] || 'Luxury'})
            </span>
          </button>

          {activeWorkout ? (
            <button
              onClick={() => setCurrentTab('active')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18202e] border border-brand/40 text-brand text-xs font-bold hover:bg-[#222c3d] transition cursor-pointer whitespace-nowrap shrink-0 shadow-sm shadow-brand/10"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-brand" />
              <span className="hidden sm:inline">Active:</span>
              <span className="font-mono tabular-nums">{liveTime}</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('active')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-brand text-black hover:opacity-90 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Start Workout</span>
            </button>
          )}

          {/* Firebase Google Auth Button */}
          {!isAuthLoading && (
            currentUser ? (
              <div className="flex items-center gap-1.5">
                {currentUser.photoURL ? (
                  <button
                    onClick={() => setCurrentTab('profile')}
                    title="Athlete Profile"
                    className="cursor-pointer"
                  >
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-7 h-7 rounded-full border border-slate-700 object-cover hover:border-brand transition"
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentTab('profile')}
                    className="w-7 h-7 rounded-full bg-[#18202e] border border-slate-700 flex items-center justify-center text-xs font-bold text-brand cursor-pointer hover:border-brand transition"
                  >
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </button>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Sign Out of Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#18202e] hover:bg-[#222c3d] border border-slate-700/80 rounded-lg transition cursor-pointer whitespace-nowrap shrink-0"
                title="Sign in with Google to sync workouts & PRs"
              >
                <LogIn className="w-3.5 h-3.5 text-brand" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )
          )}

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
