import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Dumbbell,
  HelpCircle,
  Zap,
  Cpu,
  RefreshCw,
  Flame,
  CheckCircle2,
  ChevronRight,
  Target,
  Trophy,
  Activity,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { ChatMessage } from '../types/fitness';

export const GeminiCoachChat: React.FC = () => {
  const { workoutHistory, activeWorkout, settings, personalRecords } = useFitness();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Welcome to the Apex Biomechanics Lab! I am your Olympic Strength Coach and Biomechanics Specialist.

I have full real-time access to your workout logs, active training sets, and personal records. I specialize in:

1. 🎯 Form Diagnosis & Breaking Stubborn Plateaus (e.g. stuck on lat pulldowns, bench press sticking points, squat knee valgus).
2. 📊 Post-Workout Deep Dives: Benefits achieved (myofibrillar vs sarcoplasmic stimulation), drawbacks (junk volume, recovery traps), and fatigue index.
3. 📈 Scientific Progressive Overload: Exact set/rep/rest periodization protocols for pure hypertrophy vs raw power.

Use the quick diagnostics below or describe how you perform an exercise!`,
      timestamp: Date.now(),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showContextDetails, setShowContextDetails] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Apex Coach session reset. What exercise form, workout review, or plateau would you like to tackle next?`,
        timestamp: Date.now(),
        modelUsed: selectedModel,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);
    setErrorMessage(null);

    // Build rich athlete context object
    const workoutContext = {
      athleteProfile: {
        name: settings.athleteProfile?.displayName || 'Apex Lifter',
        focus: settings.athleteProfile?.targetFocus || 'Hypertrophy',
        currentWeight: settings.athleteProfile?.bodyweightLogs[0]?.weight
          ? `${settings.athleteProfile.bodyweightLogs[0].weight} ${settings.weightUnit}`
          : 'Not recorded',
      },
      activeSession: activeWorkout
        ? {
            title: activeWorkout.title,
            elapsedMinutes: Math.round(
              (Date.now() - activeWorkout.startTime) / 60000
            ),
            exercises: activeWorkout.exercises.map((e) => ({
              name: e.name,
              targetMuscle: e.targetMuscle,
              setsCompleted: e.sets
                .filter((s) => s.completed)
                .map(
                  (s) =>
                    `Set ${s.setNumber}: ${s.weight}${settings.weightUnit} × ${s.reps} reps`
                ),
            })),
            notes: activeWorkout.notes || 'None',
          }
        : null,
      lastFinishedSession:
        workoutHistory.length > 0
          ? {
              title: workoutHistory[0].title,
              date: new Date(workoutHistory[0].endTime).toLocaleDateString(),
              durationMinutes: Math.round(
                workoutHistory[0].durationSeconds / 60
              ),
              totalVolume: `${workoutHistory[0].totalVolume} ${settings.weightUnit}`,
              totalSetsCompleted: workoutHistory[0].totalSetsCompleted,
              exercisesList: workoutHistory[0].exercises.map((e) => e.name),
              notes: workoutHistory[0].notes || 'None',
              newPrsAchieved: workoutHistory[0].newPrs || [],
            }
          : null,
      personalRecordsTop5: Object.values(personalRecords)
        .slice(0, 6)
        .map(
          (pr) =>
            `${pr.exerciseName}: ${pr.maxWeight}${settings.weightUnit} (Est. 1RM: ${pr.estimated1RM}${settings.weightUnit})`
        ),
    };

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          workoutContext,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to reach Apex Coach server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Structured High-Yield Diagnostics Prompts
  const diagnosticActions = [
    {
      icon: Target,
      label: 'Lat Pulldown Plateau',
      prompt:
        "Every time on the lat pulldown machine I am stuck on a specific weight and can't increase. How do I fix my form, setup, and scapular mechanics to break through this weight barrier?",
    },
    {
      icon: Activity,
      label: 'Audit My Last Session',
      prompt:
        'Please review my last completed workout session. Analyze how I did: what all benefits did I achieve, what were the drawbacks or junk volume, and what is the exact progressive overload plan for next time?',
    },
    {
      icon: Flame,
      label: 'Bench Press Sticking Point',
      prompt:
        'I stall a few inches off my chest on barbell bench press. How should I adjust my elbow flare, leg drive, and upper back tightness to fix this sticking point?',
    },
    {
      icon: Dumbbell,
      label: 'Hypertrophy vs Strength',
      prompt:
        'Compare a pure hypertrophy session vs pure strength session for my current routine. What rep ranges, RPE targets, and rest intervals should I use to maximize muscle size without burnout?',
    },
    {
      icon: Trophy,
      label: 'Evaluate My PR Ratios',
      prompt:
        'Audit my personal records and lift numbers. Are there any structural imbalances between my pushing, pulling, and lower body strength, and what exercises should I prioritize?',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-[#121721] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header Strip with Model Switcher & Context Overview */}
      <div className="p-4 border-b border-slate-800 bg-[#0d1017] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/40 text-brand flex items-center justify-center font-bold shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Apex Biomechanics Coach
              </h2>
              <span className="text-[10px] bg-brand text-black px-2 py-0.5 rounded-full font-bold">
                Olympic Level
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Plateau Cracking · Form Cues · Metabolic & Volume Audits
            </p>
          </div>
        </div>

        {/* Model Selection and Reset Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setShowContextDetails(!showContextDetails)}
            className="px-2.5 py-1.5 rounded-lg bg-[#18202e] hover:bg-[#222c3d] text-slate-300 text-xs border border-slate-700/80 transition flex items-center gap-1 cursor-pointer"
            title="Toggle Athlete Context telemetry"
          >
            <Activity className="w-3.5 h-3.5 text-brand" />
            <span className="hidden md:inline">Telemetry</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                showContextDetails ? 'rotate-180' : ''
              }`}
            />
          </button>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#18202e] border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand font-mono cursor-pointer"
            title="Select Gemini Engine"
          >
            <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
            <option value="gemini-3.5-flash">gemini-3.5-flash (Standard)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Reasoning)</option>
          </select>

          <button
            onClick={handleResetChat}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-[#18202e]"
            title="Reset Chat Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Athlete Telemetry Drawer */}
      {showContextDetails && (
        <div className="bg-[#0f131a] border-b border-slate-800 p-3 text-xs text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
          <div className="bg-[#18202e] p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Session</span>
            <span className="font-bold text-white">
              {activeWorkout ? activeWorkout.title : 'No active session'}
            </span>
          </div>

          <div className="bg-[#18202e] p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Last Completed Session</span>
            <span className="font-bold text-brand truncate block">
              {workoutHistory.length > 0
                ? `${workoutHistory[0].title} (${workoutHistory[0].totalVolume} ${settings.weightUnit})`
                : 'No finished workouts yet'}
            </span>
          </div>

          <div className="bg-[#18202e] p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Benchmark Records</span>
            <span className="font-bold text-white">
              {Object.keys(personalRecords).length} lifts on file
            </span>
          </div>
        </div>
      )}

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-brand text-black font-bold'
                    : 'bg-[#18202e] text-brand border border-slate-700'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-xs leading-relaxed group relative ${
                  isUser
                    ? 'bg-brand text-black font-medium shadow-md'
                    : 'bg-[#18202e] text-slate-200 border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {msg.modelUsed && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Sparkles className="w-3 h-3 text-brand" /> {msg.modelUsed}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-white p-0.5 rounded cursor-pointer"
                        title="Copy coaching cues"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-brand" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#18202e] text-brand border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#18202e] border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
              <span>Analyzing biomechanics, muscle recruitment vectors & progressive overload metrics...</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Diagnostics Action Bar */}
      <div className="px-4 py-2.5 bg-[#0d1017] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[10px] uppercase font-bold text-brand tracking-wider shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3" /> Quick Cues:
        </span>
        {diagnosticActions.map((diag, idx) => {
          const Icon = diag.icon;
          return (
            <button
              key={idx}
              onClick={() => handleSendMessage(diag.prompt)}
              className="px-3 py-1.5 rounded-xl bg-[#18202e] hover:bg-[#222c3d] text-slate-300 hover:text-white border border-slate-700/60 text-[11px] whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 group"
            >
              <Icon className="w-3 h-3 text-brand group-hover:scale-110 transition-transform" />
              <span>{diag.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form with Rainbow Accent */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 md:p-4 bg-[#0d1017] border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask coach: Describe how you performed an exercise or troubleshoot a plateau..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#18202e] border border-slate-700/80 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isLoading}
          className="p-2.5 rounded-xl bg-brand text-black font-bold disabled:opacity-40 transition cursor-pointer shrink-0 shadow-md shadow-brand/15 hover:opacity-90"
          aria-label="Send message to coach"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
