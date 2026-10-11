import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Clock,
  Dumbbell,
  AlertCircle,
  MoreVertical,
  Flame,
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { Exercise } from '../types/fitness';

interface ActiveWorkoutViewProps {
  onGoToRoutines?: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({ onGoToRoutines }) => {
  const {
    activeWorkout,
    workoutDurationSeconds,
    startWorkout,
    cancelWorkout,
    finishWorkout,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    addSetToExercise,
    removeSetFromExercise,
    updateSet,
    toggleSetComplete,
    updateExerciseNotes,
    updateExerciseRestSeconds,
    startRestTimer,
    calculate1RM,
    exercises,
    settings,
    routines,
  } = useFitness();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState<string>('All');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Time formatter
  const minutes = Math.floor(workoutDurationSeconds / 60);
  const seconds = workoutDurationSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const formattedTime = hours > 0
    ? `${hours}h ${(minutes % 60).toString().padStart(2, '0')}m`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // If no active workout, display clean zero-state launcher
  if (!activeWorkout) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 md:px-0">
        <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 md:p-8 text-center max-w-xl mx-auto shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center mx-auto mb-5">
            <Flame className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight text-white font-['Barlow_Condensed']">
            No Active Workout
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
            Ready to hit the iron? Start an empty workout to log freely or launch one of your structured routines.
          </p>

          <div className="mt-8 space-y-3">
            <div className="rainbow-glow-wrapper w-full">
              <button
                onClick={() => startWorkout(undefined, 'Quick Workout')}
                className="rainbow-glow-inner w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-brand text-black shadow-lg active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Start Empty Workout
              </button>
            </div>

            {onGoToRoutines && (
              <button
                onClick={onGoToRoutines}
                className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-[#18202e] hover:bg-[#222c3d] text-slate-200 border border-slate-700/60 transition cursor-pointer"
              >
                Browse Routine Templates ({routines.length})
              </button>
            )}
          </div>
        </div>

        {/* Quick Launch Pre-built Routines */}
        <div className="mt-10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">
            Quick Start From Templates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {routines.slice(0, 3).map((routine) => (
              <div
                key={routine.id}
                className="bg-[#121721] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-[#ccff00] uppercase tracking-wider">
                    {routine.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 line-clamp-1">
                    {routine.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {routine.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    {routine.exercises.length} exercises · ~{routine.estimatedMinutes}m
                  </span>
                  <button
                    onClick={() => startWorkout(routine.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#18202e] hover:bg-[#ccff00] hover:text-black text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate live session metrics
  let totalVolume = 0;
  let totalSets = 0;
  let completedSetsCount = 0;

  activeWorkout.exercises.forEach((ex) => {
    ex.sets.forEach((set) => {
      totalSets += 1;
      if (set.completed && set.weight > 0 && set.reps > 0) {
        completedSetsCount += 1;
        totalVolume += set.weight * set.reps;
      }
    });
  });

  // Filter exercises for modal
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesCategory =
      exerciseCategoryFilter === 'All' || ex.category === exerciseCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto pb-28 md:pb-12 px-3 md:px-0 pt-2">
      {/* Active Workout Header Strip */}
      <div className="sticky top-15 z-20 bg-[#0a0d12]/95 backdrop-blur-md pb-3 pt-1 border-b border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ccff00]">
                Live Workout
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-0.5 truncate">
              {activeWorkout.title}
            </h1>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-[#121721] px-3 py-1.5 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums text-white font-semibold">{formattedTime}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#121721] px-3 py-1.5 rounded-xl border border-slate-800">
              <Dumbbell className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono tabular-nums text-white font-semibold">
                {totalVolume.toLocaleString()} {settings.weightUnit}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-[#121721] px-3 py-1.5 rounded-xl border border-slate-800">
              <Check className="w-3.5 h-3.5 text-[#ccff00]" />
              <span className="font-mono tabular-nums text-white font-semibold">
                {completedSetsCount}/{totalSets} sets
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="rainbow-glow-wrapper">
                <button
                  onClick={() => setShowFinishConfirm(true)}
                  className="rainbow-glow-inner px-4 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-md active:scale-95 transition cursor-pointer whitespace-nowrap"
                >
                  Finish Workout
                </button>
              </div>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition cursor-pointer"
                title="Discard workout"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-5">
        {activeWorkout.exercises.map((workoutEx, exIdx) => {
          // Calculate best 1RM in this exercise for quick motivation
          let best1RM = 0;
          workoutEx.sets.forEach((s) => {
            if (s.completed && s.weight > 0 && s.reps > 0) {
              const current1RM = calculate1RM(s.weight, s.reps);
              if (current1RM > best1RM) best1RM = current1RM;
            }
          });

          return (
            <div
              key={workoutEx.id}
              className="bg-[#121721] border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-lg transition-all"
            >
              {/* Exercise Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-bold text-[#ccff00] font-mono">0{exIdx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>{workoutEx.targetMuscle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{workoutEx.equipment}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {workoutEx.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Rest timer quick trigger */}
                  <button
                    onClick={() => startRestTimer(workoutEx.restSeconds, workoutEx.name)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 bg-[#18202e] hover:bg-[#222c3d] rounded-lg border border-slate-700/60 transition cursor-pointer"
                    title="Start rest timer"
                  >
                    <Clock className="w-3 h-3 text-[#ccff00]" />
                    <span className="font-mono tabular-nums">{workoutEx.restSeconds}s</span>
                  </button>

                  <button
                    onClick={() => removeExerciseFromWorkout(workoutEx.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                    title="Remove exercise"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Set Table */}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-800/80">
                      <th className="pb-2 w-10 text-center uppercase tracking-wider">Set</th>
                      <th className="pb-2 text-slate-400 uppercase tracking-wider">Previous</th>
                      <th className="pb-2 text-slate-300 uppercase tracking-wider">{settings.weightUnit}</th>
                      <th className="pb-2 text-slate-300 uppercase tracking-wider">Reps</th>
                      <th className="pb-2 w-12 text-center uppercase tracking-wider">Done</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {workoutEx.sets.map((set, setIndex) => {
                      const est1RM = set.weight > 0 && set.reps > 0 ? calculate1RM(set.weight, set.reps) : null;

                      return (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-[#ccff00]/5' : 'hover:bg-slate-800/20'
                          }`}
                        >
                          {/* Set number */}
                          <td className="py-2.5 text-center font-mono font-bold text-slate-300">
                            {set.isWarmup ? 'W' : set.setNumber}
                          </td>

                          {/* Previous ghost reference */}
                          <td className="py-2.5 font-mono text-slate-400 tabular-nums">
                            {set.previousWeight !== undefined && set.previousReps !== undefined
                              ? `${set.previousWeight} × ${set.previousReps}`
                              : '—'}
                          </td>

                          {/* Weight input */}
                          <td className="py-2.5 pr-2">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min="0"
                                step="2.5"
                                value={set.weight === 0 ? '' : set.weight}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  updateSet(workoutEx.id, set.id, { weight: val });
                                }}
                                placeholder="0"
                                className="w-20 md:w-24 px-2.5 py-1.5 rounded-lg bg-[#18202e] border border-slate-700/80 text-white font-mono font-semibold text-center focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none"
                              />
                            </div>
                          </td>

                          {/* Reps input */}
                          <td className="py-2.5 pr-2">
                            <input
                              type="number"
                              min="0"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                updateSet(workoutEx.id, set.id, { reps: val });
                              }}
                              placeholder="0"
                              className="w-16 md:w-20 px-2.5 py-1.5 rounded-lg bg-[#18202e] border border-slate-700/80 text-white font-mono font-semibold text-center focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none"
                            />
                          </td>

                          {/* Completed checkmark button (min touch target >= 44x44) */}
                          <td className="py-2.5 text-center">
                            <button
                              onClick={() => toggleSetComplete(workoutEx.id, set.id)}
                              className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center min-h-[44px] min-w-[44px] transition-all cursor-pointer ${
                                set.completed
                                  ? 'bg-[#ccff00] text-black shadow-sm shadow-[#ccff00]/30 font-bold'
                                  : 'bg-[#18202e] border border-slate-700 hover:border-slate-500 text-slate-500'
                              }`}
                              aria-label={set.completed ? 'Mark incomplete' : 'Mark complete'}
                            >
                              <Check className={`w-5 h-5 ${set.completed ? 'stroke-[3]' : ''}`} />
                            </button>
                          </td>

                          {/* Remove set */}
                          <td className="py-2.5 text-right">
                            {workoutEx.sets.length > 1 && (
                              <button
                                onClick={() => removeSetFromExercise(workoutEx.id, set.id)}
                                className="p-1 text-slate-600 hover:text-red-400 transition"
                                title="Delete set"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Exercise Controls: Add Set & Estimated 1RM */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => addSetToExercise(workoutEx.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18202e] hover:bg-[#222c3d] text-slate-300 hover:text-white font-semibold transition cursor-pointer border border-slate-700/60"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ccff00]" />
                  Add Set
                </button>

                {best1RM > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Est. 1RM:{' '}
                    <span className="font-mono font-bold text-white">
                      {best1RM} {settings.weightUnit}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exercise CTA Button */}
      <div className="mt-6">
        <button
          onClick={() => setShowAddExerciseModal(true)}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-[#ccff00]/60 bg-[#121721]/50 hover:bg-[#121721] text-slate-300 hover:text-white font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#ccff00]" />
          Add Exercise to Workout
        </button>
      </div>

      {/* Workout Notes */}
      <div className="mt-6 bg-[#121721] border border-slate-800 rounded-2xl p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Session Notes & Reflections
        </label>
        <textarea
          value={activeWorkout.notes || ''}
          onChange={(e) => {
            // Update active workout notes directly
            if (activeWorkout) {
              activeWorkout.notes = e.target.value;
            }
          }}
          placeholder="Log gym cues, energy levels, barbell bar path thoughts, or upcoming deload notes..."
          rows={2}
          className="w-full bg-[#18202e] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#ccff00]"
        />
      </div>

      {/* Finish Workout CTA Pinned on Mobile if needed */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition"
        >
          Discard Session
        </button>
        <div className="rainbow-glow-wrapper">
          <button
            onClick={() => setShowFinishConfirm(true)}
            className="rainbow-glow-inner px-6 py-3 rounded-xl text-sm font-bold bg-brand text-black shadow-lg active:scale-95 transition cursor-pointer"
          >
            Finish Workout
          </button>
        </div>
      </div>

      {/* Modal: Add Exercise from Catalog */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#121721] border border-slate-700 rounded-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Add Exercise</h3>
                <p className="text-xs text-slate-400">Select an exercise to append to this workout</p>
              </div>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="p-4 border-b border-slate-800 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="Search exercise name or muscle..."
                  className="w-full pl-9 pr-4 py-2 bg-[#18202e] border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              {/* Category Pills (Functional filter buttons) */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setExerciseCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                      exerciseCategoryFilter === cat
                        ? 'bg-[#ccff00] text-black'
                        : 'bg-[#18202e] text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredExercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    addExerciseToWorkout(ex.id);
                    setShowAddExerciseModal(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#18202e]/70 hover:bg-[#18202e] border border-slate-800 hover:border-[#ccff00]/50 transition flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#ccff00] transition-colors">
                      {ex.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{ex.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ex.equipment}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ex.primaryMuscle}</span>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-slate-500 group-hover:text-[#ccff00] shrink-0" />
                </button>
              ))}

              {filteredExercises.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No exercises found matching your search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#121721] border border-slate-700 rounded-2xl p-5 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Discard Workout?</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Are you sure you want to cancel? All sets logged in this active session will be permanently lost.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="py-2.5 rounded-xl text-xs font-semibold bg-[#18202e] hover:bg-[#222c3d] text-slate-300"
              >
                Keep Going
              </button>
              <button
                onClick={() => {
                  cancelWorkout();
                  setShowCancelConfirm(false);
                }}
                className="py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#121721] border border-slate-700 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center mx-auto mb-3">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Finish Workout</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ready to wrap up? You logged{' '}
              <span className="text-white font-bold">{completedSetsCount} sets</span> with a total volume of{' '}
              <span className="text-[#ccff00] font-bold">
                {totalVolume.toLocaleString()} {settings.weightUnit}
              </span>.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="py-2.5 rounded-xl text-xs font-semibold bg-[#18202e] hover:bg-[#222c3d] text-slate-300"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setShowFinishConfirm(false);
                  finishWorkout();
                }}
                className="py-2.5 rounded-xl text-xs font-bold bg-[#ccff00] hover:bg-[#b8e600] text-black shadow-md shadow-[#ccff00]/20"
              >
                Save & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
