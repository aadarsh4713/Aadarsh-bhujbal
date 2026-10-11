/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FitnessProvider, useFitness } from './context/FitnessContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { WorkoutListView } from './components/WorkoutListView';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { RoutineBuilderView } from './components/RoutineBuilderView';
import { ExerciseLibraryView } from './components/ExerciseLibraryView';
import { HistoryAndStatsView } from './components/HistoryAndStatsView';
import { AthleteProfileView } from './components/AthleteProfileView';
import { GeminiCoachChat } from './components/GeminiCoachChat';
import { GymToolsLab } from './components/GymToolsLab';
import { LiveRestTimer } from './components/LiveRestTimer';
import { WorkoutSummaryModal } from './components/WorkoutSummaryModal';
import { InstantPRModal } from './components/InstantPRModal';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<'workouts' | 'active' | 'routines' | 'exercises' | 'lab' | 'coach' | 'history' | 'profile'>('workouts');
  const { activeWorkout } = useFitness();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d12] text-slate-100 selection:bg-brand selection:text-black">
      {/* Top Bar with Brand, Live Workout indicator, and Firebase Google Sign-In */}
      <Navbar currentTab={currentTab} setCurrentTab={(tab) => setCurrentTab(tab as typeof currentTab)} />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentTab === 'workouts' && (
          <WorkoutListView
            onStartWorkoutTab={() => setCurrentTab('active')}
            onGoToRoutinesTab={() => setCurrentTab('routines')}
            onGoToExercisesTab={() => setCurrentTab('exercises')}
            onGoToHistoryTab={() => setCurrentTab('history')}
            onGoToCoachTab={() => setCurrentTab('coach')}
            onGoToLabTab={() => setCurrentTab('lab')}
            onGoToProfileTab={() => setCurrentTab('profile')}
          />
        )}

        {currentTab === 'active' && (
          <ActiveWorkoutView onGoToRoutines={() => setCurrentTab('routines')} />
        )}

        {currentTab === 'routines' && (
          <RoutineBuilderView onStartWorkoutTab={() => setCurrentTab('active')} />
        )}

        {currentTab === 'exercises' && (
          <ExerciseLibraryView onGoToActiveTab={() => setCurrentTab('active')} />
        )}

        {currentTab === 'lab' && (
          <GymToolsLab />
        )}

        {currentTab === 'coach' && (
          <GeminiCoachChat />
        )}

        {currentTab === 'history' && (
          <HistoryAndStatsView />
        )}

        {currentTab === 'profile' && (
          <AthleteProfileView />
        )}
      </main>

      {/* Floating Rest Interval Timer */}
      <LiveRestTimer />

      {/* Mobile-First Bottom Navigation Dock */}
      <BottomNav currentTab={currentTab} setCurrentTab={(tab) => setCurrentTab(tab as typeof currentTab)} />

      {/* Real-time PR Pop-up Celebration ("WOW! You achieved a personal record!") */}
      <InstantPRModal />

      {/* Celebration Modal after Workout Completion */}
      <WorkoutSummaryModal />
    </div>
  );
}

export default function App() {
  return (
    <FitnessProvider>
      <MainAppContent />
    </FitnessProvider>
  );
}
