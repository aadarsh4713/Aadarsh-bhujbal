import React from 'react';
import {
  Flame,
  Plus,
  Play,
  Trophy,
  Dumbbell,
  Clock,
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  Bot,
  Calculator,
  Cloud,
  Sparkles
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

interface WorkoutListViewProps {
  onStartWorkoutTab: () => void;
  onGoToRoutinesTab: () => void;
  onGoToExercisesTab: () => void;
  onGoToHistoryTab: () => void;
  onGoToCoachTab: () => void;
  onGoToLabTab: () => void;
  onGoToProfileTab?: () => void;
}

export const WorkoutListView: React.FC<WorkoutListViewProps> = ({
  onStartWorkoutTab,
  onGoToRoutinesTab,
  onGoToExercisesTab,
  onGoToHistoryTab,
  onGoToCoachTab,
  onGoToLabTab,
  onGoToProfileTab,
}) => {
  const {
    programSplits,
    workoutHistory,
    startWorkout,
    settings,
    activeWorkout,
    currentUser,
    signInWithGoogle,
  } = useFitness();

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const workoutsThisWeek = workoutHistory.filter((w) => w.endTime >= oneWeekAgo);
  const weeklyVolume = workoutsThisWeek.reduce((acc, curr) => acc + curr.totalVolume, 0);

  let streakDays = 0;
  if (workoutHistory.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const latestWorkoutDate = new Date(workoutHistory[0].endTime);
    latestWorkoutDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - latestWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      streakDays = Math.min(workoutHistory.length, 5);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28 md:pb-12 pt-2 px-3 md:px-0">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">
              Athlete: {settings.athleteProfile?.displayName || 'Apex Lifter'}
            </span>
            <span aria-hidden="true">·</span>
            {onGoToProfileTab && (
              <button
                onClick={onGoToProfileTab}
                className="text-brand hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                title="Edit profile & theme"
              >
                <Sparkles className="w-3 h-3 text-brand" />
                Theme: <span className="capitalize">{settings.theme}</span>
              </button>
            )}
            <span aria-hidden="true">·</span>
            {currentUser ? (
              <span className="text-brand font-semibold flex items-center gap-1">
                <Cloud className="w-3 h-3" /> Cloud Synced
              </span>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="text-slate-300 hover:text-white underline cursor-pointer"
              >
                Sign in to save to cloud
              </button>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
            Build Unstoppable Strength
          </h1>
        </div>

        {/* Quick action buttons with Rainbow Glowy Texture Border */}
        <div className="flex items-center gap-3">
          {activeWorkout ? (
            <div className="rainbow-glow-wrapper w-full md:w-auto">
              <button
                onClick={onStartWorkoutTab}
                className="rainbow-glow-inner w-full md:w-auto px-5 py-3 rounded-xl font-bold text-xs bg-brand text-black shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Flame className="w-4 h-4 fill-black" />
                Resume Active Session
              </button>
            </div>
          ) : (
            <div className="rainbow-glow-wrapper w-full md:w-auto">
              <button
                onClick={() => {
                  startWorkout(undefined, 'Quick Workout');
                  onStartWorkoutTab();
                }}
                className="rainbow-glow-inner w-full md:w-auto px-5 py-3 rounded-xl font-bold text-xs bg-brand text-black shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Start Empty Workout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Coach Spotlight Banner with Rainbow Glow CTA */}
      <div className="bg-gradient-to-r from-[#121721] via-[#18202e] to-[#121721] border border-brand/30 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand/40 text-brand flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                Gemini Strength & Biomechanics Coach
              </span>
              <Sparkles className="w-3.5 h-3.5 text-brand" />
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Stuck on Lat Pulldowns or Bench Press? Let's Fix Your Form
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Describe how you perform an exercise or review your latest fatigue levels. The AI coach breaks down biomechanics, cues, and benefits.
            </p>
          </div>
        </div>

        <div className="rainbow-glow-wrapper self-start md:self-auto shrink-0">
          <button
            onClick={onGoToCoachTab}
            className="rainbow-glow-inner px-5 py-2.5 rounded-xl text-xs font-bold bg-brand text-black shadow-md whitespace-nowrap cursor-pointer"
          >
            Chat with Coach
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Weekly Volume</span>
            <TrendingUp className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {weeklyVolume > 0 ? weeklyVolume.toLocaleString() : '0'}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{settings.weightUnit} lifted this week</span>
        </div>

        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Completed Sessions</span>
            <Dumbbell className="w-4 h-4 text-brand" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {workoutHistory.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{workoutsThisWeek.length} this week</span>
        </div>

        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {streakDays > 0 ? `${streakDays} Days` : '0 Days'}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Consistency index</span>
        </div>

        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Plate & 1RM Lab</span>
            <Calculator className="w-4 h-4 text-brand" />
          </div>
          <button
            onClick={onGoToLabTab}
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 mt-3"
          >
            Open Calculator <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Program Splits Bifurcation Showcase */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Master Training Splits</h2>
            <p className="text-xs text-slate-400">Click a split to bifurcate into day rotations (Push, Pull, Legs, Arnold, etc.)</p>
          </div>
          <button
            onClick={onGoToRoutinesTab}
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Splits ({programSplits.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {programSplits.slice(0, 3).map((split) => (
            <div
              key={split.id}
              className="bg-[#121721] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between group transition"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span className="font-semibold text-brand uppercase tracking-wider">
                    {split.frequency}
                  </span>
                  <span className="font-mono text-slate-400">
                    {split.days.length} Days
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-brand transition-colors">
                  {split.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {split.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-wrap gap-1 text-[10px] text-slate-400">
                  {split.days.slice(0, 3).map((d) => (
                    <span key={d.id} className="bg-[#18202e] px-2 py-0.5 rounded text-slate-300">
                      D{d.dayNumber}: {d.style}
                    </span>
                  ))}
                  {split.days.length > 3 && <span>+{split.days.length - 3} more</span>}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  onClick={onGoToRoutinesTab}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#18202e] hover:bg-brand text-white hover:text-black border border-slate-700 hover:border-transparent transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Bifurcate Split Days
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity Strip */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-400">Past workouts with volume and PR milestones</p>
          </div>
          <button
            onClick={onGoToHistoryTab}
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
          >
            All Logs <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-8 text-center">
            <Dumbbell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-300">No Recorded Workouts Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your logged sessions will appear here with volume stats, completed exercises, and PR achievements.
            </p>
            <button
              onClick={() => {
                startWorkout(undefined, 'First Workout');
                onStartWorkoutTab();
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#18202e] hover:bg-[#222c3d] text-brand border border-slate-700/60 transition cursor-pointer"
            >
              Record First Session
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.slice(0, 3).map((w) => {
              const dateStr = new Date(w.endTime).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });
              const durMins = Math.round(w.durationSeconds / 60);

              return (
                <div
                  key={w.id}
                  className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-slate-300 font-semibold">{dateStr}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{durMins} mins</span>
                      <span aria-hidden="true">·</span>
                      <span>{w.totalSetsCompleted} sets</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {w.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Volume</span>
                      <span className="text-base font-extrabold font-mono text-white">
                        {w.totalVolume.toLocaleString()} {settings.weightUnit}
                      </span>
                    </div>

                    {w.newPrs && w.newPrs.length > 0 && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-subtle border border-brand/40 text-brand text-xs font-bold">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{w.newPrs.length} PR{w.newPrs.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
