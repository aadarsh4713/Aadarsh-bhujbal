import React from 'react';
import { Trophy, Flame, Sparkles, X } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export const InstantPRModal: React.FC = () => {
  const { activePRNotice, clearActivePRNotice, settings } = useFitness();

  if (!activePRNotice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-[#121721] border-2 border-[#ccff00] rounded-3xl p-6 shadow-2xl shadow-[#ccff00]/20 text-center relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#ccff00]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-[#ccff00]/15 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={clearActivePRNotice}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Trophy Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#ccff00] text-black flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#ccff00]/30 animate-bounce duration-700">
          <Trophy className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-[#ccff00] uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Personal Record!</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="text-2xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
          WOW! You Smashed It!
        </h2>

        <p className="text-sm font-bold text-slate-200 mt-1">
          {activePRNotice.exerciseName}
        </p>

        <div className="my-5 p-4 rounded-2xl bg-[#18202e] border border-slate-700/80">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Lifted Today</div>
          <div className="text-3xl font-black font-mono tabular-nums text-[#ccff00] mt-0.5">
            {activePRNotice.weight} {settings.weightUnit}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Est. 1-Rep Max:</span>
            <span className="font-mono font-bold text-white">
              {activePRNotice.estimated1RM} {settings.weightUnit}
            </span>
          </div>

          {activePRNotice.previousRecord > 0 && (
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-slate-500">Previous Peak:</span>
              <span className="font-mono text-slate-400">
                {activePRNotice.previousRecord} {settings.weightUnit}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={clearActivePRNotice}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-[#ccff00] hover:bg-[#b8e600] text-black shadow-lg shadow-[#ccff00]/25 active:scale-95 transition cursor-pointer"
        >
          Keep Crushing It!
        </button>
      </div>
    </div>
  );
};
