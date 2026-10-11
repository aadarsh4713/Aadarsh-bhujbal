import React from 'react';
import { Trophy, Clock, Dumbbell, Check, Flame, X, Share2 } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export const WorkoutSummaryModal: React.FC = () => {
  const { recentFinishedWorkout, clearFinishedWorkoutModal, settings } = useFitness();

  if (!recentFinishedWorkout) return null;

  const durationMins = Math.max(1, Math.round(recentFinishedWorkout.durationSeconds / 60));
  const newPrs = recentFinishedWorkout.newPrs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#121721] border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center relative">
        {/* Close Button */}
        <button
          onClick={clearFinishedWorkoutModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center mx-auto mb-4 animate-bounce duration-1000">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-[#ccff00]">
          Session Complete
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
          Outstanding Work, Athlete!
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          You conquered <span className="text-white font-bold">{recentFinishedWorkout.title}</span>. Your log has been saved to your records.
        </p>

        {/* Metric Triplet */}
        <div className="grid grid-cols-3 gap-2.5 mt-6 py-4 px-3 bg-[#18202e] rounded-2xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
            <span className="text-lg font-black font-mono text-white tabular-nums">
              {durationMins}m
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Volume</span>
            <span className="text-lg font-black font-mono text-[#ccff00] tabular-nums">
              {recentFinishedWorkout.totalVolume.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 block">{settings.weightUnit}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sets</span>
            <span className="text-lg font-black font-mono text-white tabular-nums">
              {recentFinishedWorkout.totalSetsCompleted}
            </span>
          </div>
        </div>

        {/* PRs achieved callout */}
        {newPrs.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-left">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#ccff00] mb-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>{newPrs.length} New Personal Record{newPrs.length > 1 ? 's' : ''}!</span>
            </div>
            <div className="space-y-1">
              {newPrs.map((pr, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="truncate pr-2">{pr.exerciseName}</span>
                  <span className="font-mono font-bold text-white shrink-0">
                    {pr.value} {settings.weightUnit} ({pr.type})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={clearFinishedWorkoutModal}
          className="mt-6 w-full py-3.5 rounded-xl font-bold text-xs bg-[#ccff00] hover:bg-[#b8e600] text-black shadow-lg shadow-[#ccff00]/20 active:scale-95 transition cursor-pointer"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
};
