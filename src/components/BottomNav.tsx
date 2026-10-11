import React from 'react';
import { Dumbbell, PlayCircle, Layers, Trophy, Bot, Calculator, User } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { activeWorkout } = useFitness();

  const navItems = [
    {
      id: 'workouts',
      label: 'Home',
      icon: Dumbbell,
    },
    {
      id: 'active',
      label: activeWorkout ? 'Active' : 'Train',
      icon: PlayCircle,
      hasBadge: !!activeWorkout,
    },
    {
      id: 'routines',
      label: 'Splits',
      icon: Layers,
    },
    {
      id: 'coach',
      label: 'Coach',
      icon: Bot,
      highlight: true,
    },
    {
      id: 'lab',
      label: '1RM',
      icon: Calculator,
    },
    {
      id: 'history',
      label: 'PRs',
      icon: Trophy,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d12]/95 backdrop-blur-md border-t border-slate-800 pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-7 h-16 items-center px-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[40px] transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-brand'
                  : item.highlight
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-brand' : ''}`} />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand ring-2 ring-[#0a0d12]" />
                )}
              </div>
              <span
                className={`text-[8.5px] tracking-tight mt-1 transition-all truncate max-w-[46px] ${
                  isActive ? 'font-bold text-brand' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
