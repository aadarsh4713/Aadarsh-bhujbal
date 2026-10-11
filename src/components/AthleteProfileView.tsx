import React, { useState } from 'react';
import {
  User,
  Crown,
  Flame,
  Zap,
  Trophy,
  Shield,
  Palette,
  Scale,
  Plus,
  Trash2,
  Edit2,
  Check,
  Calendar,
  Cloud,
  LogOut,
  LogIn,
  Search,
  X,
  Sparkles,
  TrendingUp,
  Download,
  Upload
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { LuxuryThemeId, PersonalRecord } from '../types/fitness';

export const AthleteProfileView: React.FC = () => {
  const {
    settings,
    updateProfile,
    setLuxuryTheme,
    personalRecords,
    saveManualPR,
    deletePR,
    logBodyweight,
    calculate1RM,
    exercises,
    currentUser,
    signInWithGoogle,
    logout,
    exportDataJSON,
    importDataJSON,
  } = useFitness();

  const profile = settings.athleteProfile;

  // Profile Edit State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editName, setEditName] = useState(profile.displayName);
  const [editBio, setEditBio] = useState(profile.bio || '');
  const [editFocus, setEditFocus] = useState(profile.targetFocus);
  const [editAvatar, setEditAvatar] = useState(profile.avatarIcon);

  // Manual PR Modal State
  const [showAddPRModal, setShowAddPRModal] = useState(false);
  const [selectedPRexerciseId, setSelectedPRexerciseId] = useState('');
  const [prSearch, setPrSearch] = useState('');
  const [prWeight, setPrWeight] = useState<number>(100);
  const [prReps, setPrReps] = useState<number>(1);

  // Bodyweight Weigh-in State
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newBodyweight, setNewBodyweight] = useState<number>(
    profile.bodyweightLogs[0]?.weight || 80
  );
  const [weightNote, setWeightNote] = useState('');

  // Available avatars
  const avatarOptions: { id: typeof profile.avatarIcon; label: string; icon: any }[] = [
    { id: 'crown', label: 'Crown', icon: Crown },
    { id: 'lion', label: 'Shield', icon: Shield },
    { id: 'flame', label: 'Flame', icon: Flame },
    { id: 'lightning', label: 'Lightning', icon: Zap },
    { id: 'trophy', label: 'Trophy', icon: Trophy },
  ];

  // Luxury Themes
  const luxuryThemes: {
    id: LuxuryThemeId;
    name: string;
    tagline: string;
    accentColor: string;
    bgPreview: string;
  }[] = [
    {
      id: 'lime',
      name: 'Electric Lime',
      tagline: 'High-contrast athletic energy',
      accentColor: '#ccff00',
      bgPreview: 'from-[#ccff00]/20 to-[#0a0d12]',
    },
    {
      id: 'gold',
      name: 'Royal Obsidian Gold',
      tagline: 'Warm champagne luxury metallic',
      accentColor: '#f59e0b',
      bgPreview: 'from-[#f59e0b]/20 to-[#0a0d12]',
    },
    {
      id: 'crimson',
      name: 'Crimson Velvet',
      tagline: 'Intense ruby & carnelian power',
      accentColor: '#f43f5e',
      bgPreview: 'from-[#f43f5e]/20 to-[#0a0d12]',
    },
    {
      id: 'emerald',
      name: 'Midnight Emerald',
      tagline: 'British racing jade prestige',
      accentColor: '#10b981',
      bgPreview: 'from-[#10b981]/20 to-[#0a0d12]',
    },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: editName.trim() || 'Apex Athlete',
      bio: editBio.trim(),
      targetFocus: editFocus,
      avatarIcon: editAvatar,
    });
    setIsEditingBio(false);
  };

  const handleSavePR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPRexerciseId) return;

    const baseEx = exercises.find((e) => e.id === selectedPRexerciseId);
    if (!baseEx) return;

    const est1RM = calculate1RM(prWeight, prReps);
    const newPR: PersonalRecord = {
      exerciseId: baseEx.id,
      exerciseName: baseEx.name,
      maxWeight: prWeight,
      maxRepsAtMaxWeight: prReps,
      estimated1RM: est1RM,
      maxVolumeSingleSet: prWeight * prReps,
      achievedAt: Date.now(),
      isManual: true,
    };

    saveManualPR(newPR);
    setShowAddPRModal(false);
    setSelectedPRexerciseId('');
  };

  const handleAddBodyweight = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBodyweight <= 0) return;
    logBodyweight(newBodyweight, weightNote.trim());
    setShowWeightModal(false);
    setWeightNote('');
  };

  const AvatarIconComponent =
    avatarOptions.find((a) => a.id === profile.avatarIcon)?.icon || Crown;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28 md:pb-12 pt-2 px-3 md:px-0">
      {/* Top Profile Hero Card */}
      <div className="bg-[#121721] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-subtle border border-brand text-brand flex items-center justify-center shrink-0 shadow-lg shadow-black/40">
              <AvatarIconComponent className="w-8 h-8 md:w-10 md:h-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                  Athlete Profile
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400 font-medium">
                  {profile.targetFocus}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white font-['Barlow_Condensed'] uppercase tracking-tight mt-0.5">
                {profile.displayName}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-2">
                "{profile.bio || 'Chasing progressive overload every session.'}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setEditName(profile.displayName);
                setEditBio(profile.bio || '');
                setEditFocus(profile.targetFocus);
                setEditAvatar(profile.avatarIcon);
                setIsEditingBio(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] hover:bg-[#222c3d] text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-brand" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* LUXURY THEME ENGINE SECTION */}
      <section className="bg-[#121721] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand" />
              <h2 className="text-lg font-bold text-white tracking-tight">Luxury Color Schemes</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalize ApexFit's visual tone with curated dark luxury palettes
            </p>
          </div>
          <span className="text-xs font-mono text-brand font-bold uppercase">
            Active: {settings.theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {luxuryThemes.map((theme) => {
            const isSelected = settings.theme === theme.id;

            return (
              <button
                key={theme.id}
                onClick={() => setLuxuryTheme(theme.id)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between h-32 relative overflow-hidden group ${
                  isSelected
                    ? 'border-brand bg-[#18202e] shadow-lg shadow-black/50 ring-1 ring-brand'
                    : 'border-slate-800 bg-[#0f131a] hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    {isSelected && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-3 group-hover:text-brand transition-colors">
                    {theme.name}
                  </h4>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">{theme.tagline}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* TILL DATE PERSONAL RECORDS (PR) MANAGER */}
      <section className="bg-[#121721] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-brand" />
              <h2 className="text-lg font-bold text-white tracking-tight">Till Date Personal Records (PRs)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review and manually customize your all-time benchmark lifts
            </p>
          </div>

          <button
            onClick={() => setShowAddPRModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-black hover:opacity-90 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add / Log PR
          </button>
        </div>

        {Object.keys(personalRecords).length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No Personal Records recorded yet. Click "Add / Log PR" to manually record your current bests!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(personalRecords).map((pr) => (
              <div
                key={pr.exerciseId}
                className="bg-[#18202e] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                      {pr.isManual ? 'Manual Record' : 'Workout Tested'}
                    </span>
                    <button
                      onClick={() => deletePR(pr.exerciseId)}
                      className="p-1 text-slate-600 hover:text-red-400 transition"
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{pr.exerciseName}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Peak Lift</span>
                    <span className="text-base font-black font-mono text-white">
                      {pr.maxWeight} {settings.weightUnit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Estimated 1RM</span>
                    <span className="text-base font-black font-mono text-brand">
                      {pr.estimated1RM} {settings.weightUnit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BODYWEIGHT TRACKER */}
      <section className="bg-[#121721] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand" />
              <h2 className="text-lg font-bold text-white tracking-tight">Bodyweight Progression</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Log periodic scale weigh-ins to track muscular bulk or cut cycles
            </p>
          </div>

          <button
            onClick={() => setShowWeightModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] hover:bg-[#222c3d] text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-brand" /> Log Bodyweight
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.bodyweightLogs.slice(0, 4).map((entry) => (
            <div
              key={entry.id}
              className="bg-[#18202e] border border-slate-800 rounded-2xl p-3.5"
            >
              <span className="text-[10px] text-slate-400 font-mono block">
                {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
              <div className="text-xl font-black font-mono text-white mt-1">
                {entry.weight} {settings.weightUnit}
              </div>
              {entry.note && (
                <span className="text-[10px] text-slate-400 italic block mt-1 truncate">
                  "{entry.note}"
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ACCOUNT & FIREBASE SYNC */}
      <section className="bg-[#121721] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand uppercase">
            <Cloud className="w-4 h-4" />
            <span>Cloud Sync Status</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            {currentUser ? `Connected as ${currentUser.email}` : 'Local-Only Mode (Offline)'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentUser
              ? 'All workout history, routines, and personal records automatically sync to Cloud Firestore.'
              : 'Sign in with Google to securely persist your records across multiple phones, tablets, and PCs.'}
          </p>
        </div>

        <div className="shrink-0">
          {currentUser ? (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] hover:bg-red-500/10 text-red-400 border border-red-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand text-black hover:opacity-90 transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <LogIn className="w-4 h-4" /> Sign In with Google
            </button>
          )}
        </div>
      </section>

      {/* MODAL: EDIT PROFILE */}
      {isEditingBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#121721] border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Customize Athlete Profile</h3>
              <button
                onClick={() => setIsEditingBio(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Athlete Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#18202e] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Choose Avatar Icon
                </label>
                <div className="flex gap-2">
                  {avatarOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setEditAvatar(opt.id)}
                        className={`flex-1 py-2 rounded-xl flex items-center justify-center transition border ${
                          editAvatar === opt.id
                            ? 'bg-brand text-black border-brand font-bold'
                            : 'bg-[#18202e] text-slate-400 border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Primary Fitness Focus
                </label>
                <select
                  value={editFocus}
                  onChange={(e) => setEditFocus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                >
                  <option value="Hypertrophy">Hypertrophy (Muscle Size & Aesthetics)</option>
                  <option value="Raw Strength">Raw Strength (Heavy Powerlifting)</option>
                  <option value="Athletic Conditioning">Athletic Conditioning & Endurance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Personal Bio / Mantra
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PR LOGGER */}
      {showAddPRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#121721] border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Record Personal Record</h3>
              <button
                onClick={() => setShowAddPRModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePR} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Select Exercise *
                </label>
                <input
                  type="text"
                  value={prSearch}
                  onChange={(e) => setPrSearch(e.target.value)}
                  placeholder="Filter exercise..."
                  className="w-full px-3 py-1.5 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white mb-2"
                />
                <select
                  required
                  value={selectedPRexerciseId}
                  onChange={(e) => setSelectedPRexerciseId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                >
                  <option value="">-- Choose Exercise ({exercises.length}) --</option>
                  {exercises
                    .filter((e) => e.name.toLowerCase().includes(prSearch.toLowerCase()))
                    .map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.category})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Weight ({settings.weightUnit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="2.5"
                    value={prWeight}
                    onChange={(e) => setPrWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Reps (at that weight)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={prReps}
                    onChange={(e) => setPrReps(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#18202e] p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400">Calculated 1RM:</span>{' '}
                <span className="font-mono font-bold text-brand">
                  {calculate1RM(prWeight, prReps)} {settings.weightUnit}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPRModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPRexerciseId}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-md disabled:opacity-40"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BODYWEIGHT WEIGH-IN */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#121721] border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Log Bodyweight</h3>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBodyweight} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Scale Weight ({settings.weightUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newBodyweight}
                  onChange={(e) => setNewBodyweight(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#18202e] border border-slate-700 rounded-xl text-2xl font-black font-mono text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Note (Morning fasted, post-workout, etc.)
                </label>
                <input
                  type="text"
                  value={weightNote}
                  onChange={(e) => setWeightNote(e.target.value)}
                  placeholder="e.g. Morning fasted weigh-in"
                  className="w-full px-3 py-2 bg-[#18202e] border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#18202e] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-brand text-black shadow-md"
                >
                  Log Weight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
