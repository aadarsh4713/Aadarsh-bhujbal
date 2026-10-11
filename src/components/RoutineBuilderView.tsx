import React, { useState } from 'react';
import {
  Plus,
  Play,
  Trash2,
  Clock,
  Dumbbell,
  Search,
  X,
  Layers,
  ChevronRight,
  ArrowLeft,
  Flame,
  Filter,
  Sparkles,
  Zap,
  Target,
  Trophy,
  Activity,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { ProgramSplit, Routine, RoutineExerciseConfig, SplitDay } from '../types/fitness';

interface RoutineBuilderViewProps {
  onStartWorkoutTab: () => void;
}

export type MasterSplitCategory = 'PPL' | 'Arnold' | 'UpperLower' | 'FullBody';

export const RoutineBuilderView: React.FC<RoutineBuilderViewProps> = ({ onStartWorkoutTab }) => {
  const {
    programSplits,
    routines,
    exercises,
    createRoutine,
    deleteRoutine,
    startWorkout,
    startSplitDayWorkout,
    settings,
  } = useFitness();

  // Navigation hierarchy state:
  // Step 1: chosenCategory (null = showing master split selection cards)
  const [selectedCategory, setSelectedCategory] = useState<MasterSplitCategory | null>(null);

  // Step 2: selectedVariant (null = showing variants within selectedCategory)
  const [selectedVariant, setSelectedVariant] = useState<ProgramSplit | null>(null);

  // Step 3: selectedSessionDay (null = showing all session days in variant, non-null = drill down into specific session layout)
  const [selectedSessionDay, setSelectedSessionDay] = useState<SplitDay | null>(null);

  // Filters within Step 2 variants
  const [frequencyFilter, setFrequencyFilter] = useState<'All' | number>('All');
  const [goalFilter, setGoalFilter] = useState<'All' | 'Hypertrophy' | 'Strength' | 'Hybrid'>('All');

  // Custom routine modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<Routine['category']>('Custom');
  const [newEstMinutes, setNewEstMinutes] = useState(45);
  const [selectedExercises, setSelectedExercises] = useState<RoutineExerciseConfig[]>([]);

  // Exercise picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Tab between "Program Splits" and "Custom Routines"
  const [activeTab, setActiveTab] = useState<'splits' | 'custom'>('splits');

  // Master split categories definition
  const splitCategories: {
    id: MasterSplitCategory;
    title: string;
    subtitle: string;
    tagline: string;
    icon: any;
    recommendedFor: string;
    bifurcationSummary: string;
    badgeColor: string;
  }[] = [
    {
      id: 'PPL',
      title: 'Push - Pull - Legs (PPL)',
      subtitle: 'The Premier Movement-Pattern Split',
      tagline: 'Divides training into anterior push, posterior pull, and lower chain',
      icon: Flame,
      recommendedFor: 'Optimal for progressive overload, hypertrophy & strength',
      bifurcationSummary: 'Push A/B · Pull A/B · Legs A/B (3, 5, or 6 days/week)',
      badgeColor: 'border-brand/40 bg-brand-subtle text-brand',
    },
    {
      id: 'Arnold',
      title: 'Arnold Antagonist Split',
      subtitle: 'Golden Era Antagonist Hypertrophy',
      tagline: 'Chest & Back, Shoulders & Arms, Legs with superset density',
      icon: Trophy,
      recommendedFor: 'Maximum arm & shoulder volume, skin-splitting pumps',
      bifurcationSummary: 'Chest+Back · Shoulders+Arms · Legs (3 or 6 days/week)',
      badgeColor: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
    },
    {
      id: 'UpperLower',
      title: 'Upper - Lower Split',
      subtitle: 'Scientific 2x/Week Frequency Model',
      tagline: 'Alternates upper body pressing/pulling with lower chain dominance',
      icon: Activity,
      recommendedFor: 'Natural lifters seeking dual strength and hypertrophy progression',
      bifurcationSummary: 'Upper A/B · Lower A/B (2, 4, or 5 days/week)',
      badgeColor: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
    },
    {
      id: 'FullBody',
      title: 'Full Body High-Frequency',
      subtitle: 'Metabolic & 3x Protein Synthesis Rate',
      tagline: 'Stimulates every major muscle group each session with compound anchors',
      icon: Zap,
      recommendedFor: 'Athletes, beginners, or 3-day per week busy schedules',
      bifurcationSummary: 'Day A (Squat) · Day B (Deadlift) · Day C (Press) / 5x5',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    },
  ];

  // Helper to open create custom routine modal
  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewDescription('');
    setNewCategory('Custom');
    setNewEstMinutes(45);
    setSelectedExercises([
      { exerciseId: 'bench-press-barbell', defaultSets: 3, defaultReps: 10, restSeconds: 90 },
      { exerciseId: 'lat-pulldown', defaultSets: 3, defaultReps: 10, restSeconds: 75 },
    ]);
    setShowCreateModal(true);
  };

  const handleAddExerciseToRoutine = (exerciseId: string) => {
    const baseEx = exercises.find((e) => e.id === exerciseId);
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId,
        defaultSets: 3,
        defaultReps: 10,
        restSeconds: baseEx ? baseEx.defaultRestSeconds : 90,
      },
    ]);
    setShowPicker(false);
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || selectedExercises.length === 0) return;

    const newRoutine: Routine = {
      id: `routine-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom training program.',
      category: newCategory,
      estimatedMinutes: Number(newEstMinutes) || 45,
      exercises: selectedExercises,
      isCustom: true,
    };

    createRoutine(newRoutine);
    setShowCreateModal(false);
    setActiveTab('custom');
  };

  // Filter program variants for the currently selected split category
  const variantsForCategory = programSplits.filter(
    (p) => p.splitCategory === selectedCategory
  );

  const filteredVariants = variantsForCategory.filter((variant) => {
    const matchesFreq =
      frequencyFilter === 'All' || variant.frequencyDays === frequencyFilter;
    const matchesGoal =
      goalFilter === 'All' || variant.goal === goalFilter;
    return matchesFreq && matchesGoal;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 md:pb-12 pt-2 px-3 md:px-0">
      {/* Top Breadcrumb Navigation Bar */}
      <nav aria-label="Hierarchical Split Breadcrumbs" className="flex items-center gap-2 text-xs text-slate-400 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => {
            setSelectedCategory(null);
            setSelectedVariant(null);
            setSelectedSessionDay(null);
            setActiveTab('splits');
          }}
          className={`hover:text-white transition cursor-pointer flex items-center gap-1 shrink-0 ${
            !selectedCategory && activeTab === 'splits' ? 'text-brand font-bold' : ''
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-brand" />
          <span>All Master Splits</span>
        </button>

        {selectedCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => {
                setSelectedVariant(null);
                setSelectedSessionDay(null);
              }}
              className={`hover:text-white transition cursor-pointer shrink-0 ${
                !selectedVariant ? 'text-brand font-bold' : ''
              }`}
            >
              {splitCategories.find((c) => c.id === selectedCategory)?.title}
            </button>
          </>
        )}

        {selectedVariant && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => setSelectedSessionDay(null)}
              className={`hover:text-white transition cursor-pointer shrink-0 truncate max-w-[200px] ${
                !selectedSessionDay ? 'text-brand font-bold' : ''
              }`}
            >
              {selectedVariant.title}
            </button>
          </>
        )}

        {selectedSessionDay && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-white font-bold shrink-0 truncate max-w-[200px]">
              Day {selectedSessionDay.dayNumber}: {selectedSessionDay.title}
            </span>
          </>
        )}
      </nav>

      {/* Main Mode Tabs: Master Splits vs My Custom Routines */}
      {!selectedCategory && (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('splits')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'splits'
                  ? 'bg-brand text-black shadow-md'
                  : 'bg-[#121721] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Master Splits Directory
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-brand text-black shadow-md'
                  : 'bg-[#121721] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <span>Custom Routines</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {routines.filter((r) => r.isCustom).length}
              </span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-[#18202e] hover:bg-[#222c3d] text-brand border border-brand/40 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Custom Routine</span>
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* LEVEL 3: DEEP DRILL-DOWN INTO SPECIFIC SESSION LAYOUT */}
      {/* ================================================================= */}
      {selectedSessionDay && selectedVariant ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedSessionDay(null)}
              className="p-2 rounded-xl bg-[#121721] hover:bg-[#18202e] border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Variant Sessions
            </button>

            <div className="rainbow-glow-wrapper">
              <button
                onClick={() => {
                  startSplitDayWorkout(selectedVariant, selectedSessionDay);
                  onStartWorkoutTab();
                }}
                className="rainbow-glow-inner px-5 py-2.5 rounded-xl font-bold text-xs bg-brand text-black shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-black" />
                Start Day {selectedSessionDay.dayNumber} Session Now
              </button>
            </div>
          </div>

          {/* Session Overview Card */}
          <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand uppercase tracking-wider">
                    DAY 0{selectedSessionDay.dayNumber} · SESSION LAYOUT
                  </span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    selectedSessionDay.style === 'Strength'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {selectedSessionDay.style}
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
                  {selectedSessionDay.title}
                </h1>
                <p className="text-sm text-slate-400 mt-1 max-w-xl">
                  {selectedSessionDay.focus}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-[#18202e] p-3 rounded-2xl border border-slate-700/80">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Exercises</span>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {selectedSessionDay.exercises.length}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Est. Sets</span>
                  <span className="text-lg font-bold text-brand tabular-nums">
                    {selectedSessionDay.exercises.reduce((acc, c) => acc + c.defaultSets, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Exercise Prescriptions List */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
              Prescribed Exercise Sequence & Biomechanics
            </h2>

            <div className="space-y-3">
              {selectedSessionDay.exercises.map((cfg, idx) => {
                const ex = exercises.find((e) => e.id === cfg.exerciseId);
                return (
                  <div
                    key={idx}
                    className="bg-[#121721] border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#18202e] border border-slate-700 text-brand flex items-center justify-center font-mono font-bold text-sm shrink-0">
                        0{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">
                            {ex ? ex.name : cfg.exerciseId}
                          </h3>
                          {ex && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#18202e] text-slate-400 border border-slate-700">
                              {ex.equipment}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-brand font-medium mt-0.5">
                          Target: {ex ? ex.primaryMuscle : 'Target Muscle'}
                        </p>

                        {ex && ex.tips && (
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xl italic line-clamp-2">
                            "{ex.tips}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 text-xs">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Prescription</span>
                        <span className="font-mono font-bold text-white text-sm tabular-nums">
                          {cfg.defaultSets} Sets × {cfg.defaultReps} Reps
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Rest Interval</span>
                        <span className="font-mono text-slate-300 text-sm flex items-center gap-1 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-brand" />
                          {cfg.restSeconds}s
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : selectedVariant && selectedCategory ? (
        /* ================================================================= */
        /* LEVEL 2: PROGRAM VARIANT SESSIONS (BIFURCATED DAYS LIST) */
        /* ================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedVariant(null)}
              className="p-2 rounded-xl bg-[#121721] hover:bg-[#18202e] border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Variants
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-brand-subtle text-brand border border-brand/30 font-bold">
                {selectedVariant.frequency}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#18202e] text-slate-300 border border-slate-700 font-semibold">
                Goal: {selectedVariant.goal || 'Hypertrophy'}
              </span>
            </div>
          </div>

          {/* Variant Header Blueprint */}
          <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              {splitCategories.find((c) => c.id === selectedCategory)?.title} · PROGRAM VARIANT
            </span>
            <h1 className="text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
              {selectedVariant.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {selectedVariant.description}
            </p>
          </div>

          {/* Grid of Bifurcated Session Days */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
              Bifurcated Training Sessions ({selectedVariant.days.length} Days)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedVariant.days.map((day) => (
                <div
                  key={day.id}
                  className="bg-[#121721] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition shadow-md group cursor-pointer"
                  onClick={() => setSelectedSessionDay(day)}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-bold text-brand font-mono text-[11px]">
                        DAY 0{day.dayNumber}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        day.style === 'Strength'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {day.style}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors">
                      {day.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{day.focus}</p>

                    {/* Quick exercises list in this day */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                        Prescribed Exercises ({day.exercises.length})
                      </span>
                      {day.exercises.slice(0, 4).map((cfg, idx) => {
                        const ex = exercises.find((e) => e.id === cfg.exerciseId);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs text-slate-300 py-0.5"
                          >
                            <span className="truncate pr-2">{ex ? ex.name : cfg.exerciseId}</span>
                            <span className="font-mono text-slate-400 text-[11px] shrink-0 tabular-nums">
                              {cfg.defaultSets} × {cfg.defaultReps}
                            </span>
                          </div>
                        );
                      })}
                      {day.exercises.length > 4 && (
                        <span className="text-[10px] text-brand font-medium">
                          +{day.exercises.length - 4} more exercises...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSessionDay(day);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#18202e] hover:bg-[#222c3d] text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Details
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startSplitDayWorkout(selectedVariant, day);
                        onStartWorkoutTab();
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-black hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      Start Day {day.dayNumber}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedCategory ? (
        /* ================================================================= */
        /* LEVEL 1: PROGRAM VARIANTS LIST (BIFURCATION BY FREQUENCY & GOAL) */
        /* ================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 rounded-xl bg-[#121721] hover:bg-[#18202e] border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> All Master Splits
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {filteredVariants.length} Variants Available
            </span>
          </div>

          {/* Category Banner */}
          {(() => {
            const cat = splitCategories.find((c) => c.id === selectedCategory);
            const Icon = cat?.icon || Layers;
            return (
              <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand/40 text-brand flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight">
                      {cat?.title}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">{cat?.tagline}</p>
                  </div>
                </div>

                {/* Filters: Frequency & Goal Bifurcation */}
                <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
                  {/* Frequency Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Frequency:
                    </span>
                    {(['All', 2, 3, 4, 5, 6] as const).map((freq) => (
                      <button
                        key={freq.toString()}
                        onClick={() => setFrequencyFilter(freq)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                          frequencyFilter === freq
                            ? 'bg-brand text-black'
                            : 'bg-[#18202e] text-slate-400 hover:text-white'
                        }`}
                      >
                        {freq === 'All' ? 'All' : `${freq}D`}
                      </button>
                    ))}
                  </div>

                  {/* Goal Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-brand" /> Goal:
                    </span>
                    {(['All', 'Hypertrophy', 'Strength', 'Hybrid'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGoalFilter(g)}
                        className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                          goalFilter === g
                            ? 'bg-brand text-black'
                            : 'bg-[#18202e] text-slate-400 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Program Variants Cards */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
              Select Program Variant to Drill Down
            </h2>

            {filteredVariants.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-[#121721] rounded-2xl border border-slate-800">
                No variants match the selected frequency and goal filter. Try selecting "All".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVariants.map((variant) => (
                  <div
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className="bg-[#121721] border border-slate-800 hover:border-brand/60 rounded-3xl p-6 transition shadow-md cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-subtle text-brand border border-brand/30">
                          {variant.frequency}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#18202e] text-slate-300 border border-slate-700">
                            {variant.goal}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {variant.level || 'Intermediate'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-brand transition-colors mt-2">
                        {variant.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {variant.description}
                      </p>

                      {/* Bifurcation session highlights */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Includes {variant.days.length} Sessions:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {variant.days.map((d) => (
                            <span
                              key={d.id}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-[#18202e] text-slate-300 border border-slate-700/60"
                            >
                              Day {d.dayNumber}: {d.focus}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-brand font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Drill Down into Sessions <ChevronRight className="w-4 h-4" />
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {variant.days.reduce((acc, d) => acc + d.exercises.length, 0)} Total Exercises
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'splits' ? (
        /* ================================================================= */
        /* LEVEL 0: MASTER SPLIT DIRECTORY (PPL, ARNOLD, UPPER-LOWER, FULL BODY) */
        /* ================================================================= */
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase tracking-wider">
              <Layers className="w-4 h-4 text-brand" />
              <span>Hierarchical Split Architect</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
              Choose Your Master Training Split
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Select foundational split architecture. Each split then bifurcates into tailored program variants based on frequency (3D, 4D, 5D, 6D) and training goals (Hypertrophy, Strength, Hybrid) allowing deep session layout customization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {splitCategories.map((cat) => {
              const Icon = cat.icon;
              const variantCount = programSplits.filter((p) => p.splitCategory === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setFrequencyFilter('All');
                    setGoalFilter('All');
                  }}
                  className="bg-[#121721] border border-slate-800 hover:border-brand/70 rounded-3xl p-6 md:p-7 transition-all duration-200 shadow-lg hover:shadow-brand/5 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand/40 text-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>

                      <span className="px-3 py-1 rounded-xl text-xs font-bold border border-slate-700 bg-[#18202e] text-slate-300">
                        {variantCount} Variants
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-white uppercase font-['Barlow_Condensed'] tracking-tight group-hover:text-brand transition-colors">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-brand font-semibold mt-0.5">{cat.subtitle}</p>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {cat.tagline}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-500 font-semibold block uppercase text-[10px]">Bifurcations:</span>
                        <span className="font-mono text-slate-300">{cat.bifurcationSummary}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span className="text-slate-500 font-semibold block uppercase text-[10px]">Best For:</span>
                        {cat.recommendedFor}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-brand flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Explore Variants & Bifurcations <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================================================================= */
        /* CUSTOM ROUTINES TAB */
        /* ================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                My Custom Routines & Templates
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Bespoke routines built and saved by you
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-brand text-black shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="bg-[#121721] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      {routine.category}
                    </span>
                    {routine.isCustom && (
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-1 text-slate-600 hover:text-red-400 transition"
                        title="Delete routine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{routine.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{routine.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                    {routine.exercises.slice(0, 4).map((cfg, idx) => {
                      const ex = exercises.find((e) => e.id === cfg.exerciseId);
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                          <span className="truncate pr-2">{ex ? ex.name : cfg.exerciseId}</span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {cfg.defaultSets} × {cfg.defaultReps}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    ~{routine.estimatedMinutes}m
                  </span>
                  <button
                    onClick={() => {
                      startWorkout(routine.id);
                      onStartWorkoutTab();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" /> Start
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: CREATE CUSTOM ROUTINE */}
      {/* ================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#121721] border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Custom Routine</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Routine Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Heavy Upper Hypertrophy B"
                  className="w-full px-3.5 py-2.5 bg-[#18202e] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Incline chest emphasis with bicep superset"
                  className="w-full px-3.5 py-2.5 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="Push">Push</option>
                    <option value="Pull">Pull</option>
                    <option value="Legs">Legs</option>
                    <option value="Upper">Upper</option>
                    <option value="Lower">Lower</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Est. Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={newEstMinutes}
                    onChange={(e) => setNewEstMinutes(parseInt(e.target.value, 10) || 45)}
                    className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Selected Exercises List in Routine Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Exercises ({selectedExercises.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerSearch('');
                      setShowPicker(true);
                    }}
                    className="text-xs font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exercise
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedExercises.map((cfg, idx) => {
                    const ex = exercises.find((e) => e.id === cfg.exerciseId);
                    return (
                      <div
                        key={idx}
                        className="bg-[#18202e] border border-slate-700 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-semibold text-white truncate max-w-[150px]">
                          {ex ? ex.name : cfg.exerciseId}
                        </span>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={cfg.defaultSets}
                            onChange={(e) => {
                              const sets = parseInt(e.target.value, 10) || 1;
                              setSelectedExercises(
                                selectedExercises.map((item, i) =>
                                  i === idx ? { ...item, defaultSets: sets } : item
                                )
                              );
                            }}
                            className="w-12 bg-[#121721] border border-slate-600 rounded px-1.5 py-0.5 text-center text-white"
                            title="Sets"
                          />
                          <span className="text-slate-400">×</span>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={cfg.defaultReps}
                            onChange={(e) => {
                              const reps = parseInt(e.target.value, 10) || 1;
                              setSelectedExercises(
                                selectedExercises.map((item, i) =>
                                  i === idx ? { ...item, defaultReps: reps } : item
                                )
                              );
                            }}
                            className="w-12 bg-[#121721] border border-slate-600 rounded px-1.5 py-0.5 text-center text-white"
                            title="Reps"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExercises(
                                selectedExercises.filter((_, i) => i !== idx)
                              );
                            }}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedExercises.length === 0}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-md disabled:opacity-40"
                >
                  Save Custom Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXERCISE PICKER FOR CUSTOM ROUTINE */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md max-h-[80vh] flex flex-col bg-[#121721] border border-slate-700 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Exercise to Routine</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search exercise..."
                className="w-full px-3.5 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
              />
            </div>

            <div className="mt-3 overflow-y-auto space-y-1.5 flex-1 max-h-80">
              {exercises
                .filter((ex) =>
                  ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                  ex.primaryMuscle.toLowerCase().includes(pickerSearch.toLowerCase())
                )
                .map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => handleAddExerciseToRoutine(ex.id)}
                    className="w-full p-2.5 rounded-xl bg-[#18202e] hover:bg-[#222c3d] border border-slate-800 hover:border-slate-700 text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <span className="text-[10px] text-brand">{ex.category} · {ex.primaryMuscle}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#121721] text-slate-400 border border-slate-800">
                      {ex.equipment}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
