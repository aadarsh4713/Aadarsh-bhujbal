import React, { useState } from 'react';
import {
  Dumbbell,
  Calculator,
  Percent,
  Layers,
  Sparkles,
  ChevronRight,
  Info
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';

export const GymToolsLab: React.FC = () => {
  const { settings } = useFitness();

  const [activeTab, setActiveTab] = useState<'plates' | 'onerepmax'>('plates');

  // Plate Calculator State
  const [targetWeight, setTargetWeight] = useState<number>(settings.weightUnit === 'kg' ? 100 : 225);
  const [barWeight, setBarWeight] = useState<number>(settings.weightUnit === 'kg' ? 20 : 45);

  // 1RM Lab State
  const [liftWeight, setLiftWeight] = useState<number>(settings.weightUnit === 'kg' ? 80 : 185);
  const [liftReps, setLiftReps] = useState<number>(6);

  // Available Plates configuration
  const kgPlates = [
    { weight: 25, color: '#ef4444', label: '25kg', height: 80 },
    { weight: 20, color: '#3b82f6', label: '20kg', height: 74 },
    { weight: 15, color: '#eab308', label: '15kg', height: 68 },
    { weight: 10, color: '#22c55e', label: '10kg', height: 60 },
    { weight: 5, color: '#94a3b8', label: '5kg', height: 50 },
    { weight: 2.5, color: '#000000', label: '2.5kg', height: 44 },
    { weight: 1.25, color: '#cbd5e1', label: '1.25kg', height: 38 },
  ];

  const lbPlates = [
    { weight: 45, color: '#3b82f6', label: '45lb', height: 80 },
    { weight: 35, color: '#eab308', label: '35lb', height: 72 },
    { weight: 25, color: '#22c55e', label: '25lb', height: 64 },
    { weight: 10, color: '#94a3b8', label: '10lb', height: 54 },
    { weight: 5, color: '#000000', label: '5lb', height: 46 },
    { weight: 2.5, color: '#cbd5e1', label: '2.5lb', height: 40 },
  ];

  const currentPlateSet = settings.weightUnit === 'kg' ? kgPlates : lbPlates;

  // Calculate plates per side
  const weightToDistribute = Math.max(0, (targetWeight - barWeight) / 2);
  let remaining = weightToDistribute;
  const platesPerSide: { weight: number; color: string; label: string; height: number; count: number }[] = [];

  for (const plate of currentPlateSet) {
    const count = Math.floor(remaining / plate.weight);
    if (count > 0) {
      platesPerSide.push({ ...plate, count });
      remaining = Math.round((remaining - count * plate.weight) * 100) / 100;
    }
  }

  // 1RM Scientific Formulas
  // Epley: weight * (1 + reps / 30)
  const epley1RM = Math.round(liftWeight * (1 + liftReps / 30));
  // Brzycki: weight * (36 / (37 - reps))
  const brzycki1RM = liftReps < 37 ? Math.round(liftWeight * (36 / (37 - liftReps))) : epley1RM;
  // Lander: (100 * weight) / (101.3 - 2.67123 * reps)
  const lander1RM = Math.round((100 * liftWeight) / (101.3 - 2.67123 * liftReps));
  // Lombardi: weight * (reps ^ 0.10)
  const lombardi1RM = Math.round(liftWeight * Math.pow(liftReps, 0.1));

  // Average 1RM consensus
  const consensus1RM = Math.round((epley1RM + brzycki1RM + lander1RM + lombardi1RM) / 4);

  // Percentage table
  const percentages = [
    { pct: 100, reps: '1 rep (Max effort)' },
    { pct: 95, reps: '2 reps (Peaking)' },
    { pct: 90, reps: '3-4 reps (Heavy strength)' },
    { pct: 85, reps: '5-6 reps (Strength hypertrophy)' },
    { pct: 80, reps: '7-8 reps (Classic hypertrophy)' },
    { pct: 75, reps: '9-10 reps (Muscle volume)' },
    { pct: 70, reps: '11-12 reps (High volume pump)' },
    { pct: 65, reps: '15 reps (Muscular endurance)' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 md:pb-12 pt-2 px-3 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-white">Gym Lab & Calculators</span>
            <span aria-hidden="true">·</span>
            <span>Mathematical Precision</span>
          </div>
          <h1 className="text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-1">
            Plate Calculator & 1-Rep Max Lab
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#121721] p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('plates')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'plates' ? 'bg-[#ccff00] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" /> Barbell Plate Loader
          </button>
          <button
            onClick={() => setActiveTab('onerepmax')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'onerepmax' ? 'bg-[#ccff00] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Percent className="w-3.5 h-3.5" /> 1RM Scientific Lab
          </button>
        </div>
      </div>

      {/* PLATE CALCULATOR VIEW */}
      {activeTab === 'plates' && (
        <div className="space-y-6">
          <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Total Barbell Weight ({settings.weightUnit})
                  </label>
                  <input
                    type="number"
                    min={barWeight}
                    step={settings.weightUnit === 'kg' ? 2.5 : 5}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(parseFloat(e.target.value) || barWeight)}
                    className="w-full px-4 py-3 bg-[#18202e] border border-slate-700 rounded-2xl text-2xl font-black font-mono text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div className="flex gap-2">
                  {[60, 80, 100, 120, 140, 180, 225, 315].map((w) => (
                    <button
                      key={w}
                      onClick={() => setTargetWeight(w)}
                      className="px-2.5 py-1 bg-[#18202e] hover:bg-[#222c3d] text-slate-300 text-xs font-mono font-bold rounded-lg border border-slate-800 cursor-pointer"
                    >
                      {w}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Barbell Weight
                  </label>
                  <select
                    value={barWeight}
                    onChange={(e) => setBarWeight(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value={settings.weightUnit === 'kg' ? 20 : 45}>
                      Standard Olympic Barbell ({settings.weightUnit === 'kg' ? '20 kg' : '45 lbs'})
                    </option>
                    <option value={settings.weightUnit === 'kg' ? 15 : 35}>
                      Women's / Technique Bar ({settings.weightUnit === 'kg' ? '15 kg' : '35 lbs'})
                    </option>
                    <option value={settings.weightUnit === 'kg' ? 10 : 25}>
                      EZ-Curl / Light Bar ({settings.weightUnit === 'kg' ? '10 kg' : '25 lbs'})
                    </option>
                    <option value={0}>Smith Machine / Zero Counterweight (0)</option>
                  </select>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-[#18202e] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Load Breakdown</span>
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Barbell Tare:</span>
                      <span className="font-mono font-bold text-white">{barWeight} {settings.weightUnit}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Per Side Load:</span>
                      <span className="font-mono font-bold text-[#ccff00] text-sm">
                        {weightToDistribute} {settings.weightUnit}
                      </span>
                    </div>
                    {remaining > 0 && (
                      <div className="flex justify-between text-amber-400 text-[11px]">
                        <span>Unloadable Remainder:</span>
                        <span className="font-mono">{remaining} {settings.weightUnit} per side</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Plates List Required */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                    Plates Needed on EACH Side:
                  </span>
                  {platesPerSide.length === 0 ? (
                    <span className="text-xs text-slate-500">Only the empty barbell is needed.</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {platesPerSide.map((p, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border border-slate-700 bg-[#121721] text-white"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: p.color }}
                          />
                          <span>{p.count} × {p.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visual Barbell Loading Simulator */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
                Visual Barbell Sleeve Representation (One Side)
              </span>

              <div className="w-full bg-[#0a0d12] rounded-2xl p-6 border border-slate-800 flex items-center justify-center min-h-[160px] overflow-x-auto">
                {/* Barbell collar shaft */}
                <div className="flex items-center">
                  {/* Inside sleeve stop collar */}
                  <div className="w-5 h-24 bg-slate-400 rounded-sm border-r-2 border-slate-600 shadow-md shrink-0" />
                  {/* Sleeve bar */}
                  <div className="relative flex items-center h-8 bg-slate-300 border-t border-b border-slate-500 px-1 min-w-[200px]">
                    {/* Stacked plates on sleeve */}
                    <div className="flex items-center gap-1 shrink-0">
                      {platesPerSide.flatMap((p) =>
                        Array.from({ length: p.count }).map((_, i) => (
                          <div
                            key={`${p.label}-${i}`}
                            style={{
                              height: `${p.height}px`,
                              backgroundColor: p.color,
                            }}
                            className="w-4 rounded-sm border border-black/40 flex items-center justify-center shadow-lg transition-transform hover:scale-105 shrink-0"
                            title={`${p.label}`}
                          >
                            <span className="text-[8px] font-mono font-bold text-white -rotate-90 select-none">
                              {p.label}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  {/* End cap */}
                  <div className="w-3 h-8 bg-slate-500 rounded-r-md border border-slate-600 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-REP MAX (1RM) LAB VIEW */}
      {activeTab === 'onerepmax' && (
        <div className="space-y-6">
          <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 shadow-xl">
            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Weight Lifted ({settings.weightUnit})
                </label>
                <input
                  type="number"
                  min="1"
                  step="2.5"
                  value={liftWeight}
                  onChange={(e) => setLiftWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#18202e] border border-slate-700 rounded-2xl text-2xl font-black font-mono text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Repetitions Completed (1 to 30)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={liftReps}
                  onChange={(e) => setLiftReps(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-4 py-3 bg-[#18202e] border border-slate-700 rounded-2xl text-2xl font-black font-mono text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            </div>

            {/* Consensus 1RM Highlight */}
            <div className="bg-gradient-to-br from-[#18202e] to-[#121721] border-2 border-[#ccff00]/40 rounded-3xl p-6 text-center mb-8 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                Scientific Consensus 1-Rep Max
              </span>
              <div className="text-5xl md:text-6xl font-black font-mono text-white tracking-tight mt-1">
                {consensus1RM} <span className="text-2xl text-slate-400">{settings.weightUnit}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                Calculated across 4 peer-reviewed biomechanical formulas based on {liftWeight}{settings.weightUnit} × {liftReps} reps.
              </p>

              {/* Formula Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-800 text-xs">
                <div className="bg-[#121721] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Epley Formula</span>
                  <span className="text-base font-bold font-mono text-white">{epley1RM} {settings.weightUnit}</span>
                </div>
                <div className="bg-[#121721] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Brzycki Formula</span>
                  <span className="text-base font-bold font-mono text-white">{brzycki1RM} {settings.weightUnit}</span>
                </div>
                <div className="bg-[#121721] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Lander Formula</span>
                  <span className="text-base font-bold font-mono text-white">{lander1RM} {settings.weightUnit}</span>
                </div>
                <div className="bg-[#121721] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Lombardi Formula</span>
                  <span className="text-base font-bold font-mono text-white">{lombardi1RM} {settings.weightUnit}</span>
                </div>
              </div>
            </div>

            {/* Percentage Training Load Table */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 px-1">
                Percentage Load & Target Training Zones
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {percentages.map((p) => {
                  const targetLoad = Math.round((consensus1RM * p.pct) / 100);

                  return (
                    <div
                      key={p.pct}
                      className="bg-[#18202e] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-bold text-[#ccff00] font-mono text-sm">{p.pct}%</span>
                        <span className="text-[11px] text-slate-400">{p.reps}</span>
                      </div>
                      <div className="text-2xl font-black font-mono text-white mt-2">
                        {targetLoad} <span className="text-xs font-normal text-slate-400">{settings.weightUnit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
