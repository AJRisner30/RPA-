import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Award, Dumbbell, Calendar, Flame, 
  Zap, Trophy, ShieldCheck, ChevronDown, History 
} from 'lucide-react';
import { WorkoutSessionLog, PersonalRecord } from '../types';
import { extractPersonalRecords, calculate1RM } from '../utils/storage';

interface ProgressGraphsTabProps {
  logs: WorkoutSessionLog[];
  onNavigateToLogs?: () => void;
}

export const ProgressGraphsTab: React.FC<ProgressGraphsTabProps> = ({ 
  logs,
  onNavigateToLogs,
}) => {
  // Extract all unique exercise names from logs
  const allExercises = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((session) => {
      session.exercises.forEach((ex) => set.add(ex.exerciseName));
    });
    return Array.from(set).sort();
  }, [logs]);

  // Selected exercise for progression graph (defaults to Bench Press or Squat or first)
  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    return allExercises.find((e) => e.toLowerCase().includes('bench')) || allExercises[0] || 'Barbell Flat Bench Press';
  });

  // Calculate PRs
  const personalRecords = useMemo(() => {
    return extractPersonalRecords(logs);
  }, [logs]);

  // Build progression data for the selected exercise across sessions
  const exerciseProgressionData = useMemo(() => {
    // Sort logs chronologically (oldest to newest)
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedLogs
      .map((session) => {
        const foundEx = session.exercises.find(
          (e) => e.exerciseName.toLowerCase() === selectedExercise.toLowerCase()
        );
        if (!foundEx || foundEx.sets.length === 0) return null;

        // Peak weight and peak estimated 1RM for this session
        const peakWeight = Math.max(...foundEx.sets.map((s) => s.weightLbs));
        const peak1RM = Math.max(...foundEx.sets.map((s) => s.estimated1RM || calculate1RM(s.weightLbs, s.reps)));
        const totalExVolume = foundEx.sets.reduce((acc, s) => acc + s.weightLbs * s.reps, 0);

        return {
          date: session.date.substring(5), // MM-DD
          fullDate: session.date,
          workout: session.workoutTitle,
          peakWeight,
          estimated1RM: peak1RM,
          volume: totalExVolume,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [logs, selectedExercise]);

  // Build total session volume over time data
  const sessionVolumeData = useMemo(() => {
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sortedLogs.map((s) => ({
      date: s.date.substring(5),
      fullDate: s.date,
      title: s.workoutTitle,
      volume: s.totalVolumeLbs,
      duration: s.durationMinutes,
      sets: s.totalSetsCompleted,
    }));
  }, [logs]);

  // Calculate total volume all-time
  const totalAllTimeVolume = useMemo(() => {
    return logs.reduce((acc, l) => acc + l.totalVolumeLbs, 0);
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher between Logs and Progress */}
      {onNavigateToLogs && (
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={onNavigateToLogs}
              className="px-4 py-1.5 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Workout Logs & Sets</span>
            </button>
            <button
              type="button"
              className="px-4 py-1.5 bg-amber-500 text-black font-black rounded-lg text-xs font-bold shadow-sm"
            >
              Progress Graphs & PRs
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Biomechanical Analytics
            </span>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Progressive Overload Tracking
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-athletic uppercase tracking-wide leading-tight">
            Progress Visualization Graphs
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Overland Athletics analytical dashboards tracking weight progression curves,
            estimated 1-rep maximums (1RM), and total tonnage density across training mesocycles.
          </p>

          {/* High Level Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Total Lifted Volume
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400">
                {(totalAllTimeVolume / 1000).toFixed(1)}k <span className="text-xs font-normal text-zinc-400">lbs</span>
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Logged Workouts
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-400">
                {logs.length} <span className="text-xs font-normal text-zinc-400">sessions</span>
              </span>
            </div>

            <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                Personal Records
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
                {personalRecords.length} <span className="text-xs font-normal text-zinc-400">PRs</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart 1: Exercise Strength & 1RM Progression Curve */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Strength & 1RM Trajectory
            </span>
            <h2 className="text-2xl font-black text-white font-athletic tracking-wide mt-0.5">
              {selectedExercise}
            </h2>
          </div>

          {/* Exercise Picker */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400 font-semibold">Select Exercise:</label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 max-w-xs truncate"
            >
              {allExercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="mt-6 h-72 sm:h-84 w-full">
          {exerciseProgressionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exerciseProgressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="color1RM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} domain={['dataMin - 15', 'dataMax + 20']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} lbs`,
                    name === 'estimated1RM' ? 'Estimated 1RM' : 'Peak Weight Lifted',
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload[0]?.payload;
                    return item ? `${item.fullDate} • ${item.workout}` : label;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(val) => (val === 'estimated1RM' ? 'Estimated 1RM (lbs)' : 'Peak Weight Lifted (lbs)')}
                />
                <Area
                  type="monotone"
                  dataKey="estimated1RM"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#color1RM)"
                  name="estimated1RM"
                />
                <Area
                  type="monotone"
                  dataKey="peakWeight"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorWeight)"
                  name="peakWeight"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
              <Dumbbell className="w-8 h-8 mb-2 opacity-40 text-amber-400" />
              <span>No recorded session logs found for {selectedExercise} yet.</span>
              <span className="text-[11px] text-zinc-600 mt-1">
                Log a workout containing this exercise to see the curve generate!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chart 2: Total Session Volume Progression (Tonnage) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="pb-4 border-b border-zinc-800">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            Training Tonnage & Density Over Time
          </span>
          <h2 className="text-2xl font-black text-white font-athletic tracking-wide mt-0.5">
            Total Workout Volume (lbs per Session)
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Calculated as total poundage: Σ (weight × reps) across all completed working sets.
          </p>
        </div>

        <div className="mt-6 h-72 sm:h-80 w-full">
          {sessionVolumeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionVolumeData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#3f3f46',
                    borderRadius: '0.75rem',
                    color: '#f4f4f5',
                    fontSize: '12px',
                  }}
                  formatter={(val: number) => [`${val.toLocaleString()} lbs`, 'Total Volume']}
                  labelFormatter={(label, payload) => {
                    const item = payload[0]?.payload;
                    return item ? `${item.fullDate} • ${item.title}` : label;
                  }}
                />
                <Bar
                  dataKey="volume"
                  fill="#e11d48"
                  radius={[8, 8, 0, 0]}
                  name="Total Volume (lbs)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              No volume data recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* PR Hall of Fame */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              ISSA Milestone Board
            </span>
            <h2 className="text-2xl font-black text-white font-athletic tracking-wide mt-0.5">
              Personal Records (PR) Hall of Fame
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {personalRecords.length} All-Time Bests
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {personalRecords.slice(0, 6).map((pr) => (
            <div
              key={pr.exerciseName}
              className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-amber-300 border border-amber-500/30">
                    PR
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">{pr.date}</span>
                </div>
                <h4 className="text-base font-bold text-white tracking-wide truncate">
                  {pr.exerciseName}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                    Weight Lifted
                  </span>
                  <span className="font-mono text-lg font-black text-white">
                    {pr.maxWeightLbs} <span className="text-xs font-normal text-zinc-400">lbs × {pr.repsAtMax}</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">
                    Est. 1RM
                  </span>
                  <span className="font-mono text-lg font-black text-amber-400">
                    {pr.estimated1RM} <span className="text-xs font-normal">lbs</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
