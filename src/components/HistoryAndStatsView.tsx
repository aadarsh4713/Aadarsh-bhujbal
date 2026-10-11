import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Dumbbell,
  Clock,
  TrendingUp,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  Check,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  FileText
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { CompletedWorkout } from '../types/fitness';

export const HistoryAndStatsView: React.FC = () => {
  const {
    workoutHistory,
    personalRecords,
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
  } = useFitness();

  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Lifetime volume
  const allTimeVolume = workoutHistory.reduce((acc, curr) => acc + curr.totalVolume, 0);
  const totalSetsLogged = workoutHistory.reduce((acc, curr) => acc + curr.totalSetsCompleted, 0);

  // Build 7-day volume histogram
  const days: { label: string; dateStr: string; volume: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1);

    const dayVolume = workoutHistory
      .filter((w) => w.endTime >= d.getTime() && w.endTime < nextDay.getTime())
      .reduce((acc, curr) => acc + curr.totalVolume, 0);

    const dayName = d.toLocaleDateString(undefined, { weekday: 'narrow' });
    days.push({
      label: dayName,
      dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: dayVolume,
    });
  }

  const maxDayVolume = Math.max(...days.map((d) => d.volume), 100);

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apexfit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportNotice('Data restored successfully!');
          setTimeout(() => setImportNotice(null), 3000);
        } else {
          setImportNotice('Invalid backup file format.');
          setTimeout(() => setImportNotice(null), 3000);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-28 md:pb-12 pt-2 px-3 md:px-0">
      {/* Header with Settings Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">Performance Analytics</span>
            <span aria-hidden="true">·</span>
            <span>Progression Timeline</span>
          </div>
          <h1 className="text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
            Workout History & Records
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#121721] hover:bg-[#18202e] border border-slate-800 rounded-xl transition cursor-pointer"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Preferences & Backup</span>
          </button>
        </div>
      </div>

      {/* Preferences Drawer if open */}
      {showSettingsDrawer && (
        <div className="bg-[#121721] border border-slate-700/80 rounded-2xl p-5 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
            App Preferences & Data Management
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Weight Unit */}
            <div className="bg-[#18202e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-2">Weight Metric</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  onClick={() => updateSettings({ weightUnit: 'kg' })}
                  className={`flex-1 py-1.5 text-center font-bold transition cursor-pointer ${
                    settings.weightUnit === 'kg' ? 'bg-[#ccff00] text-black' : 'bg-transparent text-slate-400'
                  }`}
                >
                  Kilograms (KG)
                </button>
                <button
                  onClick={() => updateSettings({ weightUnit: 'lbs' })}
                  className={`flex-1 py-1.5 text-center font-bold transition cursor-pointer ${
                    settings.weightUnit === 'lbs' ? 'bg-[#ccff00] text-black' : 'bg-transparent text-slate-400'
                  }`}
                >
                  Pounds (LBS)
                </button>
              </div>
            </div>

            {/* Sound FX */}
            <div className="bg-[#18202e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-2">Rest Timer Audio</span>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-full py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  settings.soundEnabled
                    ? 'border-[#ccff00]/40 text-[#ccff00] bg-[#ccff00]/10'
                    : 'border-slate-700 text-slate-400 bg-transparent'
                }`}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {settings.soundEnabled ? 'Beeps Active' : 'Muted'}
              </button>
            </div>

            {/* Auto Start Timer */}
            <div className="bg-[#18202e] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold block mb-2">Auto-Start Rest Timer</span>
              <button
                onClick={() => updateSettings({ autoStartTimer: !settings.autoStartTimer })}
                className={`w-full py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                  settings.autoStartTimer
                    ? 'border-[#ccff00]/40 text-[#ccff00] bg-[#ccff00]/10'
                    : 'border-slate-700 text-slate-400 bg-transparent'
                }`}
              >
                {settings.autoStartTimer ? 'Enabled on Set Done' : 'Manual Start Only'}
              </button>
            </div>

            {/* Data Export / Import */}
            <div className="bg-[#18202e] p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 font-semibold block mb-2">Backup & Sync</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 py-1.5 px-2 bg-[#121721] hover:bg-[#222c3d] text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#ccff00]" /> Export
                </button>
                <label className="flex-1 py-1.5 px-2 bg-[#121721] hover:bg-[#222c3d] text-slate-200 border border-slate-700 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-[#ccff00]" /> Import
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {importNotice && (
            <div className="mt-3 text-xs text-[#ccff00] font-semibold text-center">
              {importNotice}
            </div>
          )}
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Lifetime Volume</span>
            <TrendingUp className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {allTimeVolume.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{settings.weightUnit} cumulative</span>
        </div>

        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Sessions</span>
            <Calendar className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {workoutHistory.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Recorded workouts</span>
        </div>

        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Sets Executed</span>
            <Dumbbell className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {totalSetsLogged}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Working & warmup sets</span>
        </div>

        <div className="bg-[#121721] border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Personal Records</span>
            <Trophy className="w-4 h-4 text-[#ccff00]" />
          </div>
          <div className="text-2xl font-black font-mono tabular-nums text-white">
            {Object.keys(personalRecords).length}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Unique exercise PRs</span>
        </div>
      </div>

      {/* 7-Day Training Volume Progression Bar Chart */}
      <section className="bg-[#121721] border border-slate-800/90 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">7-Day Volume Distribution</h3>
            <p className="text-xs text-slate-400">Daily weight shifted across training sessions</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#ccff00]">
            Weekly Peak: {maxDayVolume.toLocaleString()} {settings.weightUnit}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-6 pb-2 items-end h-44">
          {days.map((day, idx) => {
            const heightPercent = maxDayVolume > 0 ? Math.max(8, (day.volume / maxDayVolume) * 100) : 8;
            const hasTrained = day.volume > 0;

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition tabular-nums">
                  {day.volume > 0 ? `${(day.volume / 1000).toFixed(1)}k` : '0'}
                </span>

                <div className="w-full max-w-[42px] bg-[#18202e] rounded-t-xl overflow-hidden flex flex-col justify-end h-28">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 ${
                      hasTrained ? 'bg-[#ccff00]' : 'bg-slate-800/40'
                    }`}
                  />
                </div>

                <span className={`text-xs font-bold mt-2 ${hasTrained ? 'text-white' : 'text-slate-500'}`}>
                  {day.label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {day.dateStr}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Personal Records Showcase */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#ccff00]" />
              Personal Records Wall
            </h2>
            <p className="text-xs text-slate-400">Peak performance achievements and calculated 1-rep maximums</p>
          </div>
        </div>

        {Object.keys(personalRecords).length === 0 ? (
          <div className="bg-[#121721] border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-500">
            No personal records saved yet. Complete a workout session to register your first PR!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(personalRecords).map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-[#121721] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-semibold text-[#ccff00] text-[11px] uppercase">
                    All-Time Peak
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(pr.achievedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white line-clamp-1">{pr.exerciseName}</h4>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Max Weight</span>
                    <span className="text-lg font-black font-mono text-white tabular-nums">
                      {pr.maxWeight} {settings.weightUnit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Calculated 1RM</span>
                    <span className="text-lg font-black font-mono text-[#ccff00] tabular-nums">
                      {pr.estimated1RM} {settings.weightUnit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Workout History Timeline Log */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Completed Session Logs</h2>
            <p className="text-xs text-slate-400">Detailed breakdown of every set, rep, and weight recorded</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {workoutHistory.length} logs total
          </span>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="bg-[#121721] border border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-500">
            You haven't completed any workouts yet. Click "Start Empty Workout" to begin!
          </div>
        ) : (
          <div className="space-y-4">
            {workoutHistory.map((workout) => {
              const isExpanded = expandedWorkoutId === workout.id;
              const dateStr = new Date(workout.endTime).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const durMins = Math.round(workout.durationSeconds / 60);

              return (
                <div
                  key={workout.id}
                  className="bg-[#121721] border border-slate-800 hover:border-slate-700/80 rounded-2xl overflow-hidden transition"
                >
                  {/* Card Header Row */}
                  <div
                    onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                    className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-slate-300 font-semibold">{dateStr}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{durMins} mins</span>
                        <span aria-hidden="true">·</span>
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {workout.title}
                      </h3>
                      {workout.notes && (
                        <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">
                          "{workout.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Total Volume
                        </span>
                        <span className="text-lg font-black font-mono text-white tabular-nums">
                          {workout.totalVolume.toLocaleString()} {settings.weightUnit}
                        </span>
                      </div>

                      {workout.newPrs && workout.newPrs.length > 0 && (
                        <div className="px-2.5 py-1 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{workout.newPrs.length} PR{workout.newPrs.length > 1 ? 's' : ''}</span>
                        </div>
                      )}

                      <button className="p-1 text-slate-400 hover:text-white transition">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detailed Sets Table */}
                  {isExpanded && (
                    <div className="px-4 pb-5 pt-2 border-t border-slate-800/80 bg-[#0d1017] space-y-4">
                      {workout.exercises.map((ex) => (
                        <div key={ex.id} className="pt-2">
                          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/60">
                            <span className="font-bold text-white">{ex.name}</span>
                            <span className="text-slate-400">{ex.targetMuscle}</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {ex.sets.map((set) => (
                              <div
                                key={set.id}
                                className={`p-2 rounded-xl text-xs font-mono flex items-center justify-between ${
                                  set.completed
                                    ? 'bg-[#18202e] text-white border border-slate-700/60'
                                    : 'bg-slate-900/50 text-slate-500'
                                }`}
                              >
                                <span className="text-slate-400 font-semibold">Set {set.setNumber}</span>
                                <span className="font-bold tabular-nums">
                                  {set.weight} {settings.weightUnit} × {set.reps}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
