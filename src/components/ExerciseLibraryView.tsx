import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Dumbbell,
  Target,
  Trophy,
  Plus,
  Clock,
  X,
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { Exercise, MuscleGroup, EquipmentType } from '../types/fitness';

interface ExerciseLibraryViewProps {
  onGoToActiveTab: () => void;
}

export const ExerciseLibraryView: React.FC<ExerciseLibraryViewProps> = ({ onGoToActiveTab }) => {
  const { exercises, personalRecords, activeWorkout, addExerciseToWorkout, startWorkout, settings } = useFitness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('All');
  const [selectedModality, setSelectedModality] = useState<'All' | 'FreeWeights' | 'Machines' | 'Bodyweight'>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('All');
  const [inspectedExercise, setInspectedExercise] = useState<Exercise | null>(null);

  const muscleGroups: ('All' | MuscleGroup)[] = [
    'All',
    'Chest',
    'Back',
    'Legs',
    'Shoulders',
    'Arms',
    'Core',
    'Cardio',
  ];

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.secondaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMuscle = selectedMuscle === 'All' || ex.category === selectedMuscle;

    let matchesModality = true;
    if (selectedModality === 'FreeWeights') {
      matchesModality = ex.equipment === 'Barbell' || ex.equipment === 'Dumbbell' || ex.equipment === 'Kettlebell';
    } else if (selectedModality === 'Machines') {
      matchesModality = ex.equipment === 'Machine' || ex.equipment === 'Cable';
    } else if (selectedModality === 'Bodyweight') {
      matchesModality = ex.equipment === 'Bodyweight';
    }

    const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;

    return matchesSearch && matchesMuscle && matchesModality && matchesEquipment;
  });

  const handleAddOrStart = (exerciseId: string) => {
    if (activeWorkout) {
      addExerciseToWorkout(exerciseId);
      onGoToActiveTab();
    } else {
      startWorkout(undefined, 'Custom Training');
      addExerciseToWorkout(exerciseId);
      onGoToActiveTab();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 md:pb-12 pt-2 px-3 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">Universal Exercise Database</span>
            <span aria-hidden="true">·</span>
            <span>Free Weights & Machines Directory</span>
          </div>
          <h1 className="text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
            Comprehensive Exercise Catalog
          </h1>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-brand font-mono">{filteredExercises.length}</span> exercises
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-[#121721] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises by name, equipment, muscle, or technique cue..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#18202e] border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand"
          />
        </div>

        {/* Free Weights vs Machines & Cables Macro Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Type:</span>
          {[
            { id: 'All', label: 'All Equipment' },
            { id: 'FreeWeights', label: '🏋️ Free Weights (Barbell & DB)' },
            { id: 'Machines', label: '⚙️ Machines & Cables' },
            { id: 'Bodyweight', label: '🤸 Bodyweight' },
          ].map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModality(mod.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedModality === mod.id
                  ? 'bg-brand text-black shadow-sm'
                  : 'bg-[#18202e] text-slate-400 hover:text-white border border-slate-700/80'
              }`}
            >
              {mod.label}
            </button>
          ))}
        </div>

        {/* Muscle group filter chips */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Muscle:</span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {muscleGroups.map((group) => (
              <button
                key={group}
                onClick={() => setSelectedMuscle(group)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedMuscle === group
                    ? 'bg-brand text-black font-bold'
                    : 'bg-[#18202e] text-slate-400 hover:text-white'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => {
          const pr = personalRecords[ex.id];

          return (
            <div
              key={ex.id}
              onClick={() => setInspectedExercise(ex)}
              className="bg-[#121721] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 md:p-5 flex flex-col justify-between transition cursor-pointer group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-bold text-brand uppercase text-[11px]">
                    {ex.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ex.equipment}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand transition-colors line-clamp-1">
                  {ex.name}
                </h3>

                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{ex.primaryMuscle}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    Assisting: {ex.secondaryMuscles.join(', ')}
                  </div>
                </div>
              </div>

              {/* Bottom Card Row */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {pr ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-brand">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">PR: {pr.maxWeight} {settings.weightUnit}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Rest: {ex.defaultRestSeconds}s
                  </span>
                )}

                <span className="text-xs font-semibold text-slate-400 group-hover:text-white flex items-center gap-0.5">
                  View Guide <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <div className="bg-[#121721] border border-slate-800 rounded-2xl p-10 text-center text-slate-500 text-xs">
          No exercises found matching your filter criteria. Try resetting muscle or gear filters.
        </div>
      )}

      {/* Exercise Detail Modal with Form Cues */}
      {inspectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#121721] border border-slate-700 rounded-3xl max-h-[88vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-bold text-brand uppercase">{inspectedExercise.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{inspectedExercise.equipment}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  {inspectedExercise.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectedExercise(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Muscle anatomy strip */}
              <div className="bg-[#18202e] border border-slate-800 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Primary Target:</span>
                  <span className="text-white font-bold">{inspectedExercise.primaryMuscle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Secondary Synergists:</span>
                  <span className="text-slate-300">{inspectedExercise.secondaryMuscles.join(', ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Recommended Rest:</span>
                  <span className="text-brand font-mono font-bold">{inspectedExercise.defaultRestSeconds} seconds</span>
                </div>
              </div>

              {/* Personal Record for this exercise if present */}
              {personalRecords[inspectedExercise.id] && (
                <div className="bg-brand-subtle border border-brand/30 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Trophy className="w-5 h-5 text-brand" />
                    <div>
                      <span className="text-brand font-bold block">Current Best Record</span>
                      <span className="text-xs text-slate-300">
                        Estimated 1RM:{' '}
                        <span className="font-mono font-bold text-white">
                          {personalRecords[inspectedExercise.id].estimated1RM} {settings.weightUnit}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-white text-base">
                    {personalRecords[inspectedExercise.id].maxWeight} {settings.weightUnit}
                  </div>
                </div>
              )}

              {/* Step by step execution instructions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                  Execution Form Cues
                </h4>
                <div className="space-y-2">
                  {inspectedExercise.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-[#18202e] border border-slate-700 text-brand font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips / Safety */}
              <div className="bg-[#121721] border border-slate-800 rounded-xl p-3 text-xs">
                <span className="font-bold text-brand block mb-1">Coach Note:</span>
                <p className="text-slate-400 leading-relaxed">{inspectedExercise.tips}</p>
              </div>
            </div>

            {/* Bottom Modal CTA */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setInspectedExercise(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] text-slate-300 hover:bg-[#222c3d]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleAddOrStart(inspectedExercise.id);
                  setInspectedExercise(null);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                {activeWorkout ? 'Add to Active Session' : 'Start Workout With This'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
