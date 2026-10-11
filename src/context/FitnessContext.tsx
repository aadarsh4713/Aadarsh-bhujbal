import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveWorkout,
  AthleteProfile,
  CompletedWorkout,
  Exercise,
  LuxuryThemeId,
  PersonalRecord,
  ProgramSplit,
  Routine,
  SplitDay,
  UserSettings,
  WorkoutExercise,
  WorkoutSet
} from '../types/fitness';
import { EXERCISE_DATABASE, PREBUILT_ROUTINES, PREBUILT_SPLITS } from '../data/exerciseLibrary';
import { playTimerSound } from '../utils/audio';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, orderBy, deleteDoc } from 'firebase/firestore';

const STORAGE_KEY_WORKOUTS = 'apexfit_workout_history_v1';
const STORAGE_KEY_ACTIVE = 'apexfit_active_workout_v1';
const STORAGE_KEY_ROUTINES = 'apexfit_routines_v1';
const STORAGE_KEY_PRS = 'apexfit_personal_records_v1';
const STORAGE_KEY_SETTINGS = 'apexfit_settings_v1';

export interface InstantPRNotice {
  exerciseName: string;
  weight: number;
  estimated1RM: number;
  previousRecord: number;
}

interface FitnessContextType {
  // Auth
  currentUser: User | null;
  isAuthLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Database & Catalog
  exercises: Exercise[];
  routines: Routine[];
  programSplits: ProgramSplit[];
  workoutHistory: CompletedWorkout[];
  personalRecords: Record<string, PersonalRecord>;
  settings: UserSettings;

  // Active Workout
  activeWorkout: ActiveWorkout | null;
  workoutDurationSeconds: number;
  startWorkout: (routineId?: string, customName?: string) => void;
  startSplitDayWorkout: (split: ProgramSplit, day: SplitDay) => void;
  cancelWorkout: () => void;
  finishWorkout: () => CompletedWorkout | null;
  addExerciseToWorkout: (exerciseId: string) => void;
  removeExerciseFromWorkout: (workoutExerciseId: string) => void;
  addSetToExercise: (workoutExerciseId: string) => void;
  removeSetFromExercise: (workoutExerciseId: string, setId: string) => void;
  updateSet: (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  toggleSetComplete: (workoutExerciseId: string, setId: string) => void;
  updateExerciseNotes: (workoutExerciseId: string, notes: string) => void;
  updateExerciseRestSeconds: (workoutExerciseId: string, seconds: number) => void;

  // Rest Timer
  restTimer: {
    remainingSeconds: number;
    totalSeconds: number;
    isRunning: boolean;
    exerciseName?: string;
  } | null;
  startRestTimer: (seconds: number, exerciseName?: string) => void;
  stopRestTimer: () => void;
  adjustRestTimer: (deltaSeconds: number) => void;
  toggleRestTimerPause: () => void;

  // Routines & Splits
  createRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (routineId: string) => void;

  // Profile & Luxury Themes
  setLuxuryTheme: (theme: LuxuryThemeId) => void;
  updateProfile: (updates: Partial<AthleteProfile>) => void;
  saveManualPR: (pr: PersonalRecord) => void;
  deletePR: (exerciseId: string) => void;
  logBodyweight: (weight: number, note?: string) => void;

  // Settings & Utilities
  updateSettings: (updates: Partial<UserSettings>) => void;
  calculate1RM: (weight: number, reps: number) => number;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Summary & Instant PR Modals
  recentFinishedWorkout: CompletedWorkout | null;
  clearFinishedWorkoutModal: () => void;
  activePRNotice: InstantPRNotice | null;
  clearActivePRNotice: () => void;
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

const DEFAULT_PROFILE: AthleteProfile = {
  displayName: 'Apex Athlete',
  avatarIcon: 'crown',
  bio: 'Relentless progressive overload and clean biomechanics.',
  targetFocus: 'Hypertrophy',
  theme: 'lime',
  bodyweightLogs: [
    { id: 'bw-1', weight: 80, date: Date.now() - 7 * 24 * 60 * 60 * 1000, note: 'Starting baseline' },
  ],
};

const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: 'kg',
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartTimer: true,
  defaultRestSeconds: 90,
  athleteName: 'Apex Athlete',
  preferredModel: 'gemini-3.8-flash',
  theme: 'lime',
  athleteProfile: DEFAULT_PROFILE,
};

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [exercises] = useState<Exercise[]>(EXERCISE_DATABASE);
  const [programSplits] = useState<ProgramSplit[]>(PREBUILT_SPLITS);

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          athleteProfile: { ...DEFAULT_PROFILE, ...(parsed.athleteProfile || {}) },
          theme: parsed.theme || parsed.athleteProfile?.theme || 'lime',
        };
      }
    } catch {
      return DEFAULT_SETTINGS;
    }
    return DEFAULT_SETTINGS;
  });

  // Apply theme to document root
  useEffect(() => {
    const currentTheme = settings.theme || 'lime';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [settings.theme]);

  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROUTINES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PREBUILT_ROUTINES;
  });

  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkout[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKOUTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [personalRecords, setPersonalRecords] = useState<Record<string, PersonalRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [recentFinishedWorkout, setRecentFinishedWorkout] = useState<CompletedWorkout | null>(null);
  const [activePRNotice, setActivePRNotice] = useState<InstantPRNotice | null>(null);
  const [workoutDurationSeconds, setWorkoutDurationSeconds] = useState(0);

  const [restTimer, setRestTimer] = useState<{
    remainingSeconds: number;
    totalSeconds: number;
    isRunning: boolean;
    exerciseName?: string;
  } | null>(null);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        try {
          const workoutsPath = `users/${user.uid}/workouts`;
          const q = query(collection(db, workoutsPath), orderBy('endTime', 'desc'));
          const snapshot = await getDocs(q);
          const cloudWorkouts: CompletedWorkout[] = [];
          snapshot.forEach((docSnap) => {
            cloudWorkouts.push(docSnap.data() as CompletedWorkout);
          });
          if (cloudWorkouts.length > 0) {
            setWorkoutHistory(cloudWorkouts);
          }

          const recordsPath = `users/${user.uid}/records`;
          const recordsSnap = await getDocs(collection(db, recordsPath));
          const cloudPRs: Record<string, PersonalRecord> = {};
          recordsSnap.forEach((docSnap) => {
            const data = docSnap.data() as PersonalRecord;
            cloudPRs[data.exerciseId] = data;
          });
          if (Object.keys(cloudPRs).length > 0) {
            setPersonalRecords(cloudPRs);
          }
        } catch (error) {
          console.warn('Initial Firestore sync offline or empty:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Apply luxury color scheme data-theme attribute to root document
  useEffect(() => {
    const activeTheme = settings.theme || settings.athleteProfile?.theme || 'lime';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [settings.theme, settings.athleteProfile?.theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
    } catch {}
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKOUTS, JSON.stringify(workoutHistory));
    } catch {}
  }, [workoutHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRS, JSON.stringify(personalRecords));
    } catch {}
  }, [personalRecords]);

  useEffect(() => {
    try {
      if (activeWorkout) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(activeWorkout));
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE);
      }
    } catch {}
  }, [activeWorkout]);

  // Workout duration clock
  useEffect(() => {
    if (!activeWorkout) {
      setWorkoutDurationSeconds(0);
      return;
    }

    const updateDuration = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - activeWorkout.startTime) / 1000));
      setWorkoutDurationSeconds(elapsed);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Rest timer countdown
  useEffect(() => {
    if (!restTimer || !restTimer.isRunning) return;

    const interval = setInterval(() => {
      setRestTimer((current) => {
        if (!current || !current.isRunning) return current;

        const nextSeconds = current.remainingSeconds - 1;

        if (nextSeconds <= 0) {
          if (settings.soundEnabled) {
            playTimerSound('final');
          }
          return null;
        }

        if (nextSeconds <= 3 && settings.soundEnabled) {
          playTimerSound('tick');
        }

        return {
          ...current,
          remainingSeconds: nextSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer?.isRunning, settings.soundEnabled]);

  const startRestTimer = (seconds: number, exerciseName?: string) => {
    const validSeconds = Math.max(5, seconds);
    setRestTimer({
      remainingSeconds: validSeconds,
      totalSeconds: validSeconds,
      isRunning: true,
      exerciseName,
    });
    if (settings.soundEnabled) {
      playTimerSound('start');
    }
  };

  const stopRestTimer = () => {
    setRestTimer(null);
  };

  const adjustRestTimer = (deltaSeconds: number) => {
    setRestTimer((current) => {
      if (!current) return null;
      const nextRemaining = Math.max(0, current.remainingSeconds + deltaSeconds);
      if (nextRemaining === 0) return null;
      return {
        ...current,
        remainingSeconds: nextRemaining,
        totalSeconds: Math.max(current.totalSeconds, nextRemaining),
      };
    });
  };

  const toggleRestTimerPause = () => {
    setRestTimer((current) => {
      if (!current) return null;
      return {
        ...current,
        isRunning: !current.isRunning,
      };
    });
  };

  const calculate1RM = (weight: number, reps: number): number => {
    if (weight <= 0 || reps <= 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  // Profile & Theme Methods
  const setLuxuryTheme = (theme: LuxuryThemeId) => {
    setSettings((prev) => ({
      ...prev,
      theme,
      athleteProfile: {
        ...prev.athleteProfile,
        theme,
      },
    }));
  };

  const updateProfile = (updates: Partial<AthleteProfile>) => {
    setSettings((prev) => {
      const updatedProfile = { ...prev.athleteProfile, ...updates };
      return {
        ...prev,
        athleteName: updatedProfile.displayName || prev.athleteName,
        theme: updatedProfile.theme || prev.theme,
        athleteProfile: updatedProfile,
      };
    });

    if (currentUser) {
      const userDocPath = `users/${currentUser.uid}`;
      setDoc(doc(db, userDocPath), {
        userId: currentUser.uid,
        email: currentUser.email,
        displayName: updates.displayName || settings.athleteProfile.displayName,
        weightUnit: settings.weightUnit,
        updatedAt: new Date().toISOString(),
      }, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, userDocPath);
      });
    }
  };

  const saveManualPR = (pr: PersonalRecord) => {
    const updated = { ...personalRecords, [pr.exerciseId]: pr };
    setPersonalRecords(updated);

    if (currentUser) {
      const recordPath = `users/${currentUser.uid}/records/${pr.exerciseId}`;
      setDoc(doc(db, recordPath), pr).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, recordPath);
      });
    }
  };

  const deletePR = (exerciseId: string) => {
    const updated = { ...personalRecords };
    delete updated[exerciseId];
    setPersonalRecords(updated);

    if (currentUser) {
      const recordPath = `users/${currentUser.uid}/records/${exerciseId}`;
      deleteDoc(doc(db, recordPath)).catch((err) => {
        handleFirestoreError(err, OperationType.DELETE, recordPath);
      });
    }
  };

  const logBodyweight = (weight: number, note?: string) => {
    const newEntry = {
      id: `bw-${Date.now()}`,
      weight,
      date: Date.now(),
      note,
    };
    updateProfile({
      bodyweightLogs: [newEntry, ...settings.athleteProfile.bodyweightLogs],
    });
  };

  // Start Workout
  const startWorkout = (routineId?: string, customName?: string) => {
    const now = Date.now();
    let initialExercises: WorkoutExercise[] = [];
    let title = customName || 'Quick Workout';

    if (routineId) {
      const routine = routines.find((r) => r.id === routineId);
      if (routine) {
        title = routine.title;
        initialExercises = routine.exercises.map((cfg) => {
          const baseEx = exercises.find((e) => e.id === cfg.exerciseId);
          const sets: WorkoutSet[] = [];
          for (let i = 1; i <= cfg.defaultSets; i++) {
            sets.push({
              id: `${cfg.exerciseId}-set-${i}-${Math.random().toString(36).substring(2, 7)}`,
              setNumber: i,
              weight: 0,
              reps: cfg.defaultReps,
              completed: false,
              isWarmup: i === 1 && cfg.defaultSets > 3,
            });
          }

          return {
            id: `we-${cfg.exerciseId}-${Math.random().toString(36).substring(2, 7)}`,
            exerciseId: cfg.exerciseId,
            name: baseEx ? baseEx.name : 'Exercise',
            targetMuscle: baseEx ? baseEx.primaryMuscle : 'General',
            equipment: baseEx ? baseEx.equipment : 'Barbell',
            restSeconds: cfg.restSeconds || 90,
            sets,
          };
        });
      }
    } else {
      const bench = exercises.find((e) => e.id === 'bench-press-barbell');
      if (bench) {
        initialExercises = [
          {
            id: `we-${bench.id}-${Math.random().toString(36).substring(2, 7)}`,
            exerciseId: bench.id,
            name: bench.name,
            targetMuscle: bench.primaryMuscle,
            equipment: bench.equipment,
            restSeconds: bench.defaultRestSeconds,
            sets: [
              {
                id: `set-1-${Math.random().toString(36).substring(2, 7)}`,
                setNumber: 1,
                weight: 60,
                reps: 8,
                completed: false,
              },
              {
                id: `set-2-${Math.random().toString(36).substring(2, 7)}`,
                setNumber: 2,
                weight: 60,
                reps: 8,
                completed: false,
              },
            ],
          },
        ];
      }
    }

    const newActiveWorkout: ActiveWorkout = {
      id: `workout-${now}`,
      routineId,
      title,
      startTime: now,
      exercises: initialExercises,
    };

    setActiveWorkout(newActiveWorkout);
  };

  const startSplitDayWorkout = (split: ProgramSplit, day: SplitDay) => {
    const now = Date.now();
    const title = `${split.title} — ${day.title}`;

    const initialExercises: WorkoutExercise[] = day.exercises.map((cfg) => {
      const baseEx = exercises.find((e) => e.id === cfg.exerciseId);
      const sets: WorkoutSet[] = [];
      for (let i = 1; i <= cfg.defaultSets; i++) {
        sets.push({
          id: `${cfg.exerciseId}-set-${i}-${Math.random().toString(36).substring(2, 7)}`,
          setNumber: i,
          weight: 0,
          reps: cfg.defaultReps,
          completed: false,
          isWarmup: i === 1 && cfg.defaultSets > 3,
        });
      }

      return {
        id: `we-${cfg.exerciseId}-${Math.random().toString(36).substring(2, 7)}`,
        exerciseId: cfg.exerciseId,
        name: baseEx ? baseEx.name : 'Exercise',
        targetMuscle: baseEx ? baseEx.primaryMuscle : 'General',
        equipment: baseEx ? baseEx.equipment : 'Barbell',
        restSeconds: cfg.restSeconds || 90,
        sets,
      };
    });

    const newActiveWorkout: ActiveWorkout = {
      id: `workout-${now}`,
      routineId: `${split.id}-${day.id}`,
      title,
      startTime: now,
      exercises: initialExercises,
    };

    setActiveWorkout(newActiveWorkout);
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
    setRestTimer(null);
  };

  const addExerciseToWorkout = (exerciseId: string) => {
    if (!activeWorkout) return;
    const baseEx = exercises.find((e) => e.id === exerciseId);
    if (!baseEx) return;

    let lastWeight = 20;
    let lastReps = 10;
    for (const past of workoutHistory) {
      const pastEx = past.exercises.find((e) => e.exerciseId === exerciseId);
      if (pastEx && pastEx.sets.length > 0) {
        const completedSets = pastEx.sets.filter((s) => s.completed && s.weight > 0);
        if (completedSets.length > 0) {
          lastWeight = completedSets[0].weight;
          lastReps = completedSets[0].reps;
          break;
        }
      }
    }

    const newWorkoutExercise: WorkoutExercise = {
      id: `we-${exerciseId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: baseEx.id,
      name: baseEx.name,
      targetMuscle: baseEx.primaryMuscle,
      equipment: baseEx.equipment,
      restSeconds: baseEx.defaultRestSeconds,
      sets: [
        {
          id: `set-1-${Date.now()}`,
          setNumber: 1,
          weight: lastWeight,
          reps: lastReps,
          completed: false,
        },
        {
          id: `set-2-${Date.now() + 1}`,
          setNumber: 2,
          weight: lastWeight,
          reps: lastReps,
          completed: false,
        },
        {
          id: `set-3-${Date.now() + 2}`,
          setNumber: 3,
          weight: lastWeight,
          reps: lastReps,
          completed: false,
        },
      ],
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newWorkoutExercise],
    });
  };

  const removeExerciseFromWorkout = (workoutExerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.filter((e) => e.id !== workoutExerciseId),
    });
  };

  const addSetToExercise = (workoutExerciseId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) => {
        if (ex.id !== workoutExerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const nextSetNumber = ex.sets.length + 1;
        const newSet: WorkoutSet = {
          id: `set-${nextSetNumber}-${Date.now()}`,
          setNumber: nextSetNumber,
          weight: lastSet ? lastSet.weight : 0,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          previousWeight: lastSet ? lastSet.weight : undefined,
          previousReps: lastSet ? lastSet.reps : undefined,
        };
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      }),
    });
  };

  const removeSetFromExercise = (workoutExerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) => {
        if (ex.id !== workoutExerciseId) return ex;
        const filtered = ex.sets.filter((s) => s.id !== setId);
        const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return {
          ...ex,
          sets: renumbered,
        };
      }),
    });
  };

  const updateSet = (workoutExerciseId: string, setId: string, updates: Partial<WorkoutSet>) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) => {
        if (ex.id !== workoutExerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set) => (set.id === setId ? { ...set, ...updates } : set)),
        };
      }),
    });
  };

  const toggleSetComplete = (workoutExerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    let willBeCompleted = false;
    let exerciseRestTime = 90;
    let exerciseName = '';
    let completedSetWeight = 0;
    let completedSetReps = 0;
    let currentExerciseId = '';

    setActiveWorkout((curr) => {
      if (!curr) return null;
      return {
        ...curr,
        exercises: curr.exercises.map((ex) => {
          if (ex.id !== workoutExerciseId) return ex;
          exerciseRestTime = ex.restSeconds || 90;
          exerciseName = ex.name;
          currentExerciseId = ex.exerciseId;
          return {
            ...ex,
            sets: ex.sets.map((set) => {
              if (set.id === setId) {
                willBeCompleted = !set.completed;
                completedSetWeight = set.weight;
                completedSetReps = set.reps;
                return { ...set, completed: willBeCompleted };
              }
              return set;
            }),
          };
        }),
      };
    });

    if (willBeCompleted) {
      if (settings.autoStartTimer) {
        startRestTimer(exerciseRestTime, exerciseName);
      }

      if (completedSetWeight > 0 && completedSetReps > 0 && currentExerciseId) {
        const existingPR = personalRecords[currentExerciseId];
        const est1RM = calculate1RM(completedSetWeight, completedSetReps);
        const previousMax = existingPR ? existingPR.maxWeight : 0;

        if (completedSetWeight > previousMax || (existingPR && est1RM > existingPR.estimated1RM)) {
          setActivePRNotice({
            exerciseName,
            weight: completedSetWeight,
            estimated1RM: est1RM,
            previousRecord: previousMax,
          });

          try {
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#ccff00', '#f59e0b', '#38bdf8', '#ffffff'],
            });
          } catch {}
        }
      }
    }
  };

  const clearActivePRNotice = () => {
    setActivePRNotice(null);
  };

  const updateExerciseNotes = (workoutExerciseId: string, notes: string) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, notes } : ex
      ),
    });
  };

  const updateExerciseRestSeconds = (workoutExerciseId: string, seconds: number) => {
    if (!activeWorkout) return;
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map((ex) =>
        ex.id === workoutExerciseId ? { ...ex, restSeconds: seconds } : ex
      ),
    });
  };

  const finishWorkout = (): CompletedWorkout | null => {
    if (!activeWorkout) return null;

    const endTime = Date.now();
    const durationSeconds = Math.max(60, Math.floor((endTime - activeWorkout.startTime) / 1000));

    let totalVolume = 0;
    let totalSetsCompleted = 0;
    const newPrsList: { exerciseName: string; type: 'Weight' | '1RM' | 'Volume'; value: number }[] = [];
    const updatedRecords = { ...personalRecords };

    activeWorkout.exercises.forEach((ex) => {
      const existingPR = updatedRecords[ex.exerciseId];
      let maxExWeight = existingPR ? existingPR.maxWeight : 0;
      let maxEx1RM = existingPR ? existingPR.estimated1RM : 0;
      let maxExVol = existingPR ? existingPR.maxVolumeSingleSet : 0;
      let brokePR = false;

      ex.sets.forEach((set) => {
        if (set.completed && set.weight > 0 && set.reps > 0) {
          totalSetsCompleted += 1;
          const setVolume = set.weight * set.reps;
          totalVolume += setVolume;

          const est1RM = calculate1RM(set.weight, set.reps);

          if (set.weight > maxExWeight) {
            maxExWeight = set.weight;
            newPrsList.push({ exerciseName: ex.name, type: 'Weight', value: set.weight });
            brokePR = true;
          }

          if (est1RM > maxEx1RM) {
            maxEx1RM = est1RM;
            newPrsList.push({ exerciseName: ex.name, type: '1RM', value: est1RM });
            brokePR = true;
          }

          if (setVolume > maxExVol) {
            maxExVol = setVolume;
            brokePR = true;
          }
        }
      });

      if (brokePR) {
        const recordDoc: PersonalRecord = {
          exerciseId: ex.exerciseId,
          exerciseName: ex.name,
          maxWeight: maxExWeight,
          maxRepsAtMaxWeight: 1,
          estimated1RM: maxEx1RM,
          maxVolumeSingleSet: maxExVol,
          achievedAt: endTime,
        };
        updatedRecords[ex.exerciseId] = recordDoc;

        if (currentUser) {
          const recordPath = `users/${currentUser.uid}/records/${ex.exerciseId}`;
          setDoc(doc(db, recordPath), recordDoc).catch((err) => {
            handleFirestoreError(err, OperationType.WRITE, recordPath);
          });
        }
      }
    });

    const completed: CompletedWorkout = {
      id: activeWorkout.id,
      routineId: activeWorkout.routineId,
      userId: currentUser?.uid,
      title: activeWorkout.title,
      startTime: activeWorkout.startTime,
      endTime,
      durationSeconds,
      totalVolume,
      totalSetsCompleted,
      exercises: activeWorkout.exercises,
      notes: activeWorkout.notes,
      newPrs: newPrsList,
    };

    setWorkoutHistory([completed, ...workoutHistory]);
    setPersonalRecords(updatedRecords);
    setActiveWorkout(null);
    setRestTimer(null);
    setRecentFinishedWorkout(completed);

    if (currentUser) {
      const workoutDocPath = `users/${currentUser.uid}/workouts/${completed.id}`;
      setDoc(doc(db, workoutDocPath), completed).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, workoutDocPath);
      });
    }

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ccff00', '#f59e0b', '#38bdf8', '#ffffff'],
      });
    } catch {}

    return completed;
  };

  const clearFinishedWorkoutModal = () => {
    setRecentFinishedWorkout(null);
  };

  const createRoutine = (newRoutine: Routine) => {
    setRoutines([newRoutine, ...routines]);
    if (currentUser) {
      const path = `users/${currentUser.uid}/routines/${newRoutine.id}`;
      setDoc(doc(db, path), newRoutine).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, path);
      });
    }
  };

  const updateRoutine = (updated: Routine) => {
    setRoutines(routines.map((r) => (r.id === updated.id ? updated : r)));
  };

  const deleteRoutine = (routineId: string) => {
    setRoutines(routines.filter((r) => r.id !== routineId));
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const exportDataJSON = (): string => {
    const payload = {
      apexfit_version: '3.0',
      exported_at: new Date().toISOString(),
      workoutHistory,
      personalRecords,
      routines,
      settings,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.workoutHistory && Array.isArray(data.workoutHistory)) {
        setWorkoutHistory(data.workoutHistory);
      }
      if (data.personalRecords && typeof data.personalRecords === 'object') {
        setPersonalRecords(data.personalRecords);
      }
      if (data.routines && Array.isArray(data.routines)) {
        setRoutines(data.routines);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      return true;
    } catch {
      return false;
    }
  };

  return (
    <FitnessContext.Provider
      value={{
        currentUser,
        isAuthLoading,
        signInWithGoogle,
        logout,
        exercises,
        routines,
        programSplits,
        workoutHistory,
        personalRecords,
        settings,
        activeWorkout,
        workoutDurationSeconds,
        startWorkout,
        startSplitDayWorkout,
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
        restTimer,
        startRestTimer,
        stopRestTimer,
        adjustRestTimer,
        toggleRestTimerPause,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        setLuxuryTheme,
        updateProfile,
        saveManualPR,
        deletePR,
        logBodyweight,
        updateSettings,
        calculate1RM,
        exportDataJSON,
        importDataJSON,
        recentFinishedWorkout,
        clearFinishedWorkoutModal,
        activePRNotice,
        clearActivePRNotice,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
