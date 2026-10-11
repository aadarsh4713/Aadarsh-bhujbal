export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Cardio'
  | 'Full Body';

export type EquipmentType =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Kettlebell'
  | 'Bands'
  | 'Cardio Equipment';

export type LuxuryThemeId = 'lime' | 'gold' | 'crimson' | 'emerald';

export interface BodyweightEntry {
  id: string;
  weight: number;
  date: number; // timestamp
  note?: string;
}

export interface AthleteProfile {
  displayName: string;
  avatarIcon: 'crown' | 'lion' | 'falcon' | 'flame' | 'lightning' | 'trophy';
  bio?: string;
  targetFocus: 'Hypertrophy' | 'Raw Strength' | 'Athletic Conditioning';
  theme: LuxuryThemeId;
  bodyweightLogs: BodyweightEntry[];
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: EquipmentType;
  instructions: string[];
  tips: string;
  defaultRestSeconds: number;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  isWarmup?: boolean;
  previousWeight?: number;
  previousReps?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  targetMuscle: string;
  equipment: EquipmentType;
  restSeconds: number;
  sets: WorkoutSet[];
  notes?: string;
}

export interface ActiveWorkout {
  id: string;
  routineId?: string;
  title: string;
  startTime: number;
  endTime?: number;
  exercises: WorkoutExercise[];
  notes?: string;
}

export interface CompletedWorkout {
  id: string;
  routineId?: string;
  userId?: string;
  title: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  totalVolume: number;
  totalSetsCompleted: number;
  exercises: WorkoutExercise[];
  notes?: string;
  newPrs?: {
    exerciseName: string;
    type: 'Weight' | '1RM' | 'Volume';
    value: number;
  }[];
}

export interface RoutineExerciseConfig {
  exerciseId: string;
  defaultSets: number;
  defaultReps: number;
  restSeconds: number;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower' | 'Full Body' | 'Custom';
  exercises: RoutineExerciseConfig[];
  estimatedMinutes: number;
  isCustom?: boolean;
  focusStyle?: 'Hypertrophy' | 'Strength' | 'Endurance';
}

export interface SplitDay {
  id: string;
  dayNumber: number;
  title: string;
  focus: string;
  style: 'Hypertrophy' | 'Strength' | 'Hybrid';
  exercises: RoutineExerciseConfig[];
}

export interface ProgramSplit {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  frequency: string;
  frequencyDays?: number; // e.g. 3, 4, 5, 6
  goal?: 'Hypertrophy' | 'Strength' | 'Hybrid' | 'Endurance';
  splitCategory?: 'PPL' | 'Arnold' | 'UpperLower' | 'FullBody';
  splitType: 'PPL' | 'Arnold' | 'UpperLower' | 'PPLUpperLower' | 'FullBody' | '5x5' | 'BroSplit';
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  days: SplitDay[];
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxRepsAtMaxWeight: number;
  estimated1RM: number;
  maxVolumeSingleSet: number;
  achievedAt: number;
  isManual?: boolean;
}

export interface UserSettings {
  weightUnit: 'kg' | 'lbs';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartTimer: boolean;
  defaultRestSeconds: number;
  athleteName: string;
  preferredModel?: string;
  theme: LuxuryThemeId;
  athleteProfile: AthleteProfile;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
}
