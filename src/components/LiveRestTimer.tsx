import React, { useState } from 'react';
import { Play, Pause, X, Plus, Minus, Bell, Maximize2, Minimize2 } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export const LiveRestTimer: React.FC = () => {
  const { restTimer, stopRestTimer, adjustRestTimer, toggleRestTimerPause } = useFitness();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!restTimer) return null;

  const { remainingSeconds, totalSeconds, isRunning, exerciseName } = restTimer;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG Circle calculations for circular progress
  const strokeWidth = 6;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <>
      {/* Mini Floating Bar (Docked right above bottom navigation or bottom of viewport) */}
      {!isExpanded && (
        <div className="fixed bottom-18 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-[#121721]/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl transition-all">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Mini Ring + Time */}
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#1e293b"
                    strokeWidth="3"
                    fill="transparent"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#ccff00"
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={2 * Math.PI * 15 - (2 * Math.PI * 15 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-300"
                  />
                </svg>
                <Bell className="w-3.5 h-3.5 text-[#ccff00] absolute animate-pulse" />
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 truncate max-w-[120px]">
                  Rest {exerciseName ? `· ${exerciseName}` : ''}
                </div>
                <div className="text-base font-bold font-mono tabular-nums text-white group-hover:text-[#ccff00] transition-colors leading-none mt-0.5">
                  {timeFormatted}
                </div>
              </div>
            </button>

            {/* Right: Quick actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => adjustRestTimer(30)}
                className="px-2 py-1 text-xs font-semibold bg-[#18202e] hover:bg-[#222c3d] text-slate-300 rounded-lg border border-slate-700/60 active:scale-95 transition"
                title="Add 30 seconds"
              >
                +30s
              </button>

              <button
                onClick={toggleRestTimerPause}
                className="p-1.5 bg-[#18202e] hover:bg-[#222c3d] text-white rounded-lg border border-slate-700/60 active:scale-95 transition"
                aria-label={isRunning ? 'Pause rest timer' : 'Resume rest timer'}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#ccff00]" />}
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                title="Expand timer"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={stopRestTimer}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Close timer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Modal View for High-Focus Rest Intervals */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#121721] border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Top header row */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400 text-xs">
              <span className="font-semibold tracking-wider uppercase text-slate-300">
                Rest Interval
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg hover:text-white hover:bg-slate-800 transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {exerciseName && (
              <p className="mt-4 text-xs font-medium text-slate-400 truncate max-w-[240px]">
                Target: <span className="text-white font-semibold">{exerciseName}</span>
              </p>
            )}

            {/* Circular Progress Ring */}
            <div className="relative w-48 h-48 my-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="#18202e"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="#ccff00"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-[stroke-dashoffset] duration-500"
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                  {timeFormatted}
                </span>
                <span className="text-[11px] font-semibold text-[#ccff00] mt-1 tracking-wider uppercase">
                  {isRunning ? 'Resting' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Time Adjustments */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => adjustRestTimer(-15)}
                className="flex items-center gap-1 px-3 py-2 bg-[#18202e] hover:bg-[#222c3d] text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 transition active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" /> 15s
              </button>
              <button
                onClick={() => adjustRestTimer(30)}
                className="flex items-center gap-1 px-3 py-2 bg-[#18202e] hover:bg-[#222c3d] text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> 30s
              </button>
              <button
                onClick={() => adjustRestTimer(60)}
                className="flex items-center gap-1 px-3 py-2 bg-[#18202e] hover:bg-[#222c3d] text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> 60s
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={toggleRestTimerPause}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-[#18202e] hover:bg-[#222c3d] text-white border border-slate-700 transition flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 text-slate-400" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#ccff00]" /> Resume
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  stopRestTimer();
                  setIsExpanded(false);
                }}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-[#ccff00] hover:bg-[#b8e600] text-black transition flex items-center justify-center gap-1 shadow-md shadow-[#ccff00]/10"
              >
                Skip Rest
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
