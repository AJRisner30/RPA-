import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Footprints, 
  TrendingUp, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Flame, 
  Trophy, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  MapPin, 
  Scale, 
  Heart, 
  ChevronRight, 
  History, 
  Zap, 
  Compass, 
  Mountain,
  Award
} from 'lucide-react';
import { 
  RuckSessionLog, 
  WorkoutSessionLog, 
  AthleteProfile, 
  RuckTerrainType 
} from '../types';
import { 
  formatRuckPace, 
  estimateRuckCalories, 
  RUCK_STANDARDS 
} from '../data/ruckData';
import { useFirebase } from '../context/FirebaseContext';
import { 
  saveRuckLogToFirestore, 
  deleteRuckLogFromFirestore,
  saveWorkoutLogToFirestore 
} from '../utils/firebaseSync';

interface RuckProgressTabProps {
  ruckLogs: RuckSessionLog[];
  workoutLogs: WorkoutSessionLog[];
  currentAthlete: AthleteProfile;
  onSaveRuckLog: (log: RuckSessionLog, syncToWorkoutLogs: boolean) => void;
  onDeleteRuckLog: (id: string) => void;
  onNavigateToWorkoutLogs?: () => void;
  onNavigateToGraphs?: () => void;
}

const PRESET_WEIGHTS = [20, 25, 30, 35, 45, 50, 60];
const PRESET_DISTANCES = [2.0, 3.1, 4.0, 5.0, 6.2, 8.0, 10.0, 12.0];
const TERRAINS: RuckTerrainType[] = [
  'Pavement / Road',
  'Trails / Forest',
  'Hilly Terrain',
  'Mixed Tactical',
  'Treadmill / Incline'
];

export const RuckProgressTab: React.FC<RuckProgressTabProps> = ({
  ruckLogs,
  workoutLogs,
  currentAthlete,
  onSaveRuckLog,
  onDeleteRuckLog,
  onNavigateToWorkoutLogs,
  onNavigateToGraphs,
}) => {
  const { user } = useFirebase();

  // Logging Form State
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [weightLbs, setWeightLbs] = useState<number | ''>(35);
  const [distanceMiles, setDistanceMiles] = useState<number | ''>(4.0);
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(60);
  const [terrain, setTerrain] = useState<RuckTerrainType>('Pavement / Road');
  const [heartRateAvg, setHeartRateAvg] = useState<number | ''>('');
  const [rpe, setRpe] = useState<number>(7);
  const [notes, setNotes] = useState('');
  const [linkToWorkoutLogs, setLinkToWorkoutLogs] = useState(true);

  // Active View Filter for Unified Timeline & Athlete Scope
  const [feedFilter, setFeedFilter] = useState<'all' | 'rucks_only' | 'gym_only'>('all');
  const [chartMetric, setChartMetric] = useState<'weight_distance' | 'workload' | 'pace'>('weight_distance');
  const [athleteFilter, setAthleteFilter] = useState<'current' | 'all'>('current');

  // Scoped ruck logs: starts fresh and empty for each athlete until they create their own
  const activeRuckLogs = useMemo(() => {
    if (athleteFilter === 'all') return ruckLogs;
    return ruckLogs.filter(
      (r) => r.athleteId === currentAthlete.id || (!r.athleteId && (currentAthlete.id === 'athlete-default' || currentAthlete.id === 'athlete-aj-risner'))
    );
  }, [ruckLogs, currentAthlete.id, athleteFilter]);

  // Scoped gym workout logs for unified history
  const activeWorkoutLogs = useMemo(() => {
    if (athleteFilter === 'all') return workoutLogs;
    return workoutLogs.filter(
      (w) => w.athleteId === currentAthlete.id || (!w.athleteId && (currentAthlete.id === 'athlete-default' || currentAthlete.id === 'athlete-aj-risner'))
    );
  }, [workoutLogs, currentAthlete.id, athleteFilter]);

  // Computed Live Metrics for the Form
  const livePaceMinPerMile = useMemo(() => {
    const dist = Number(distanceMiles);
    const dur = Number(durationMinutes);
    if (!dist || !dur || dist <= 0) return 0;
    return dur / dist;
  }, [distanceMiles, durationMinutes]);

  const liveWorkloadIndex = useMemo(() => {
    const dist = Number(distanceMiles);
    const wt = Number(weightLbs);
    if (!dist || !wt) return 0;
    return Math.round(dist * wt * 10) / 10;
  }, [distanceMiles, weightLbs]);

  const liveCalories = useMemo(() => {
    const dist = Number(distanceMiles);
    const wt = Number(weightLbs);
    const dur = Number(durationMinutes);
    return estimateRuckCalories(
      dist || 0,
      currentAthlete.weightLbs || 185,
      wt || 35,
      dur || 60
    );
  }, [distanceMiles, weightLbs, durationMinutes, currentAthlete.weightLbs]);

  // Overall Statistics from Scoped Ruck Logs
  const stats = useMemo(() => {
    if (activeRuckLogs.length === 0) {
      return {
        totalSessions: 0,
        maxWeight: 0,
        longestDistance: 0,
        maxWorkload: 0,
        totalMiles: 0,
        totalWorkload: 0,
        avgPaceFormatted: '0:00',
        bestPaceFormatted: '0:00',
      };
    }

    let maxWeight = 0;
    let longestDistance = 0;
    let maxWorkload = 0;
    let totalMiles = 0;
    let totalWorkload = 0;
    let totalPaceSum = 0;
    let validPaceCount = 0;
    let minPace = 999;

    activeRuckLogs.forEach((log) => {
      if (log.weightLbs > maxWeight) maxWeight = log.weightLbs;
      if (log.distanceMiles > longestDistance) longestDistance = log.distanceMiles;
      const workload = log.workloadIndex || (log.distanceMiles * log.weightLbs);
      if (workload > maxWorkload) maxWorkload = workload;
      totalMiles += log.distanceMiles;
      totalWorkload += workload;

      const pace = log.paceMinPerMile || (log.durationMinutes && log.distanceMiles ? log.durationMinutes / log.distanceMiles : 0);
      if (pace > 0) {
        totalPaceSum += pace;
        validPaceCount += 1;
        if (pace < minPace) minPace = pace;
      }
    });

    const avgPace = validPaceCount > 0 ? totalPaceSum / validPaceCount : 0;

    return {
      totalSessions: activeRuckLogs.length,
      maxWeight,
      longestDistance: Math.round(longestDistance * 10) / 10,
      maxWorkload: Math.round(maxWorkload * 10) / 10,
      totalMiles: Math.round(totalMiles * 10) / 10,
      totalWorkload: Math.round(totalWorkload),
      avgPaceFormatted: formatRuckPace(avgPace),
      bestPaceFormatted: minPace < 999 ? formatRuckPace(minPace) : '0:00',
    };
  }, [activeRuckLogs]);

  // Chronological Progression Chart Data
  const chartData = useMemo(() => {
    const sorted = [...activeRuckLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.map((log) => {
      const pace = log.paceMinPerMile || (log.durationMinutes && log.distanceMiles ? log.durationMinutes / log.distanceMiles : 0);
      const workload = log.workloadIndex || (log.distanceMiles * log.weightLbs);
      return {
        date: log.date.substring(5), // MM-DD
        fullDate: log.date,
        title: log.title,
        weightLbs: log.weightLbs,
        distanceMiles: log.distanceMiles,
        workloadIndex: Math.round(workload * 10) / 10,
        paceMinPerMile: Math.round(pace * 10) / 10,
        paceFormatted: formatRuckPace(pace),
        durationMinutes: log.durationMinutes,
        terrain: log.terrain,
      };
    });
  }, [activeRuckLogs]);

  // Unified Chronological Training Activity Feed (Rucks + Gym Workout Logs)
  const unifiedActivityFeed = useMemo(() => {
    type UnifiedActivityItem = 
      | { type: 'ruck'; date: string; timestamp: number; data: RuckSessionLog }
      | { type: 'gym'; date: string; timestamp: number; data: WorkoutSessionLog };

    const items: UnifiedActivityItem[] = [];

    if (feedFilter === 'all' || feedFilter === 'rucks_only') {
      activeRuckLogs.forEach((r) => {
        items.push({
          type: 'ruck',
          date: r.date,
          timestamp: new Date(r.date).getTime(),
          data: r,
        });
      });
    }

    if (feedFilter === 'all' || feedFilter === 'gym_only') {
      activeWorkoutLogs.forEach((w) => {
        items.push({
          type: 'gym',
          date: w.date,
          timestamp: new Date(w.date).getTime(),
          data: w,
        });
      });
    }

    // Sort descending (most recent first)
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [activeRuckLogs, activeWorkoutLogs, feedFilter]);

  // Handle Form Submission
  const handleSubmitLog = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = Number(distanceMiles);
    const wt = Number(weightLbs);
    const dur = Number(durationMinutes);

    if (!dist || dist <= 0 || !wt || wt <= 0 || !dur || dur <= 0) {
      alert('Please provide valid distance, weight, and duration.');
      return;
    }

    const pace = dur / dist;
    const workload = dist * wt;

    const newRuckLog: RuckSessionLog = {
      id: `ruck-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid,
      athleteId: currentAthlete.id,
      title: title.trim() || `Tactical Ruck (${wt} lbs • ${dist} mi)`,
      date,
      distanceMiles: dist,
      weightLbs: wt,
      durationMinutes: dur,
      paceMinPerMile: Math.round(pace * 100) / 100,
      workloadIndex: Math.round(workload * 10) / 10,
      terrain,
      heartRateAvg: heartRateAvg ? Number(heartRateAvg) : undefined,
      rpe,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveRuckLog(newRuckLog, linkToWorkoutLogs);

    // Reset Form
    setTitle('');
    setNotes('');
    setHeartRateAvg('');
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Switcher between Logs, Graphs, and Ruck */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg">
          {onNavigateToWorkoutLogs && (
            <button
              type="button"
              onClick={onNavigateToWorkoutLogs}
              className="px-3.5 sm:px-4 py-2 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Workout Logs</span>
            </button>
          )}
          {onNavigateToGraphs && (
            <button
              type="button"
              onClick={onNavigateToGraphs}
              className="px-3.5 sm:px-4 py-2 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Strength PRs</span>
            </button>
          )}
          <button
            type="button"
            className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40"
          >
            <Footprints className="w-3.5 h-3.5 text-black" />
            <span>Ruck Progression</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#111822] via-[#141b24] to-[#1a232f] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" />
              Tactical Load Carriage
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Progressive Overload
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              Athlete: <strong className="text-amber-400">{currentAthlete.name}</strong>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white font-athletic uppercase tracking-wide leading-tight">
            Ruck Progression & Workload Lab
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Log heavy ruck marches, monitor load carriage progressive overload, track pace efficiency,
            and visualize your aerobic power progression alongside gym strength logs.
          </p>

          {/* Quick Action Button & Athlete Scope Switcher */}
          <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>{showForm ? 'Close Ruck Logger' : 'Log New Ruck Session'}</span>
              </button>
              <span className="text-xs text-zinc-400">
                {stats.totalSessions} {athleteFilter === 'current' ? `${currentAthlete.name}'s Sessions` : 'Total Sessions'}
              </span>
            </div>

            {/* Athlete Scope Switcher */}
            <div className="inline-flex p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setAthleteFilter('current')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  athleteFilter === 'current'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {currentAthlete.name} ({activeRuckLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setAthleteFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  athleteFilter === 'all'
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Athletes ({ruckLogs.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ruck Logging Form Modal / Expandable Card */}
      {showForm && (
        <div className="bg-[#121820] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Footprints className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
                  Record Rucking Session
                </h2>
                <p className="text-xs text-zinc-400">
                  Enter distance, pack weight, and duration to calculate pace and total workload index.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitLog} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Date */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-[#18202b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-medium outline-none"
                />
              </div>

              {/* Title / Route */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                  Session Title / Route
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tactical 4-Mile March"
                  className="w-full bg-[#18202b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* Pack Weight (lbs) */}
              <div>
                <label className="block text-amber-400 font-bold uppercase text-[11px] mb-1 flex items-center justify-between">
                  <span>Pack Weight (lbs)</span>
                  <span className="text-[10px] text-zinc-400">Required</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="150"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  placeholder="35"
                  className="w-full bg-[#18202b] border border-amber-500/60 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold text-base outline-none"
                />
                {/* Quick Weight Chips */}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {PRESET_WEIGHTS.map((wt) => (
                    <button
                      key={wt}
                      type="button"
                      onClick={() => setWeightLbs(wt)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        weightLbs === wt
                          ? 'bg-amber-400 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {wt}#
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance (Miles) */}
              <div>
                <label className="block text-amber-400 font-bold uppercase text-[11px] mb-1 flex items-center justify-between">
                  <span>Distance (Miles)</span>
                  <span className="text-[10px] text-zinc-400">Required</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={distanceMiles}
                  onChange={(e) => setDistanceMiles(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  placeholder="4.0"
                  className="w-full bg-[#18202b] border border-amber-500/60 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-bold text-base outline-none"
                />
                {/* Quick Distance Chips */}
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {PRESET_DISTANCES.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setDistanceMiles(dist)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        distanceMiles === dist
                          ? 'bg-amber-400 text-black'
                          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                    >
                      {dist}mi
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Duration, Terrain, Heart Rate, RPE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {/* Duration Minutes */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="600"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  placeholder="60"
                  className="w-full bg-[#18202b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-medium outline-none"
                />
              </div>

              {/* Terrain */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                  Terrain
                </label>
                <select
                  value={terrain}
                  onChange={(e) => setTerrain(e.target.value as RuckTerrainType)}
                  className="w-full bg-[#18202b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white font-medium outline-none"
                >
                  {TERRAINS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Heart Rate Avg (BPM) */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                  Avg Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  min="40"
                  max="220"
                  value={heartRateAvg}
                  onChange={(e) => setHeartRateAvg(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 142"
                  className="w-full bg-[#18202b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white placeholder-zinc-500 outline-none"
                />
              </div>

              {/* RPE 1-10 */}
              <div>
                <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                  Effort (RPE 1-10): <strong className="text-amber-400">{rpe}/10</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer mt-2"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-zinc-400 font-bold uppercase text-[11px] mb-1">
                Field Notes & Coaching Reflections
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Pacing felt controlled, used trekking cadence, zero hotspots on feet."
                className="w-full bg-[#18202b] border border-zinc-700 focus:border-amber-400 rounded-xl px-3 py-2 text-white placeholder-zinc-500 outline-none"
              />
            </div>

            {/* Live Calculation Output Card */}
            <div className="bg-[#192330] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Calculated Pace</div>
                  <div className="text-lg font-black text-amber-400 font-mono">
                    {formatRuckPace(livePaceMinPerMile)} <span className="text-xs text-zinc-400">/mi</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-zinc-700" />

                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Workload Index (mi × lbs)</div>
                  <div className="text-lg font-black text-emerald-400 font-mono">
                    {liveWorkloadIndex} <span className="text-xs text-zinc-400">lb-mi</span>
                  </div>
                </div>

                <div className="h-8 w-px bg-zinc-700" />

                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Est. Energy Burn</div>
                  <div className="text-lg font-black text-white font-mono">
                    ~{liveCalories} <span className="text-xs text-zinc-400">kcal</span>
                  </div>
                </div>
              </div>

              {/* Sync to Workout Logs checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={linkToWorkoutLogs}
                  onChange={(e) => setLinkToWorkoutLogs(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  Also add to <strong className="text-amber-400">General Workout Logs</strong>
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-950/40 cursor-pointer"
              >
                Save Ruck Session
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Key Metric Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Max Pack Weight */}
        <div className="bg-[#141b24] border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Max Pack</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.maxWeight} <span className="text-xs font-normal text-zinc-400">lbs</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Peak tactical load</div>
        </div>

        {/* Longest Distance */}
        <div className="bg-[#141b24] border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Longest Ruck</span>
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {stats.longestDistance} <span className="text-xs font-normal text-zinc-400">mi</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Single session peak</div>
        </div>

        {/* Max Single-Session Workload */}
        <div className="bg-[#141b24] border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Peak Workload</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {stats.maxWorkload}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">mi × lbs volume</div>
        </div>

        {/* Total Miles Rucked */}
        <div className="bg-[#141b24] border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Miles</span>
            <Footprints className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {stats.totalMiles} <span className="text-xs font-normal text-zinc-400">mi</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Cumulative career</div>
        </div>

        {/* Cumulative Workload */}
        <div className="bg-[#141b24] border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Load</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {stats.totalWorkload.toLocaleString()}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Total lb-miles carriage</div>
        </div>

        {/* Best Pace */}
        <div className="bg-[#141b24] border border-zinc-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Best Pace</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {stats.bestPaceFormatted}
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">Fastest min/mile</div>
        </div>
      </div>

      {/* Visual Progression Over Time Graphs */}
      <div className="bg-[#121820] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                Progression Curves Over Time
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visualize how pack weight, rucking distance, and total workload have stepped up across sessions.
            </p>
          </div>

          {/* Chart Metric Switcher */}
          <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMetric('weight_distance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'weight_distance'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Weight & Distance
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('workload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'workload'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Workload Index
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('pace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartMetric === 'pace'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pace (min/mi)
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="mt-6 h-72 sm:h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'weight_distance' ? (
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262f3c" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#fbbf24" tick={{ fontSize: 11 }} label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', fill: '#fbbf24', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#34d399" tick={{ fontSize: 11 }} label={{ value: 'Distance (mi)', angle: 90, position: 'insideRight', fill: '#34d399', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18202b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any, name: string) => {
                      if (name === 'Pack Weight') return [`${val} lbs`, name];
                      if (name === 'Distance') return [`${val} miles`, name];
                      return [val, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="weightLbs" name="Pack Weight" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={24} />
                  <Line yAxisId="right" type="monotone" dataKey="distanceMiles" name="Distance" stroke="#34d399" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                </ComposedChart>
              ) : chartMetric === 'workload' ? (
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262f3c" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#fbbf24" tick={{ fontSize: 11 }} label={{ value: 'Workload (mi × lbs)', angle: -90, position: 'insideLeft', fill: '#fbbf24', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18202b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} lb-miles`, 'Workload Index']}
                  />
                  <Area type="monotone" dataKey="workloadIndex" name="Workload Index" stroke="#f59e0b" fill="url(#colorWorkload)" fillOpacity={0.2} strokeWidth={3} />
                  <Line type="monotone" dataKey="workloadIndex" stroke="#fbbf24" strokeWidth={3} dot={{ r: 6, fill: '#fbbf24' }} />
                  <defs>
                    <linearGradient id="colorWorkload" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </ComposedChart>
              ) : (
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262f3c" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#38bdf8" tick={{ fontSize: 11 }} label={{ value: 'Pace (min/mi)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18202b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${formatRuckPace(val)} /mi`, 'Pace']}
                  />
                  <Line type="monotone" dataKey="paceMinPerMile" name="Pace (min/mi)" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#0284c7' }} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-950/40 rounded-2xl border border-zinc-800/80">
              <Footprints className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-zinc-300 text-xs sm:text-sm font-semibold">
                New Logbook Ready — 0 rucks recorded for {athleteFilter === 'current' ? currentAthlete.name : 'this filter'}
              </p>
              <p className="text-zinc-500 text-xs mt-1 max-w-sm">
                Every athlete starts fresh with new logs until they create their own. Click &quot;Log New Ruck Session&quot; above to plot your progression curves.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tactical Milestone Standards Checklist */}
      <div className="bg-[#121820] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide">
            Tactical & Military Milestone Standards
          </h2>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Established benchmarks for tactical athletes, military combat conditioning, and endurance rucking.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {RUCK_STANDARDS.map((standard) => {
            // Check if athlete has met or exceeded this standard
            const hasPassed = activeRuckLogs.some((l) => {
              const weightOk = l.weightLbs >= standard.targetWeightLbs;
              const distanceOk = l.distanceMiles >= standard.targetDistanceMiles;
              const timeOk = l.durationMinutes <= standard.timeCapMinutes;
              return weightOk && distanceOk && timeOk;
            });

            // Format time display
            const timeDisplay =
              standard.timeCapMinutes % 60 === 0
                ? `${standard.timeCapMinutes / 60} hrs (${standard.timeCapMinutes}m)`
                : `${standard.timeCapMinutes} min`;

            return (
              <div
                key={standard.id}
                className={`p-4 rounded-2xl border transition-all ${
                  hasPassed
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                    : 'bg-[#161e27] border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white">{standard.badge}</span>
                  {hasPassed ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-800 text-zinc-400">
                      IN PROGRESS
                    </span>
                  )}
                </div>

                <div className="font-black text-sm text-zinc-100 mb-1">{standard.name}</div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
                  <span>{standard.targetWeightLbs} lbs</span>
                  <span>•</span>
                  <span>{standard.targetDistanceMiles} mi</span>
                  <span>•</span>
                  <span>&lt;{timeDisplay}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {standard.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Training Timeline: Ruck Sessions Alongside Existing Workout Logs */}
      <div className="bg-[#121820] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide">
                Unified Training History & Timeline
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Chronological feed viewing your rucking load carriage sessions directly alongside gym strength logs.
            </p>
          </div>

          {/* Feed Filter Switcher */}
          <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFeedFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                feedFilter === 'all'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Training ({ruckLogs.length + workoutLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setFeedFilter('rucks_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                feedFilter === 'rucks_only'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3 h-3" />
              <span>Rucks ({ruckLogs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedFilter('gym_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                feedFilter === 'gym_only'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3 h-3" />
              <span>Gym ({workoutLogs.length})</span>
            </button>
          </div>
        </div>

        {/* Activity Stream */}
        <div className="mt-5 space-y-3">
          {unifiedActivityFeed.length > 0 ? (
            unifiedActivityFeed.map((item) => {
              if (item.type === 'ruck') {
                const ruck = item.data;
                const pace = ruck.paceMinPerMile || (ruck.durationMinutes && ruck.distanceMiles ? ruck.durationMinutes / ruck.distanceMiles : 0);
                const workload = ruck.workloadIndex || (ruck.distanceMiles * ruck.weightLbs);

                return (
                  <div
                    key={`ruck-${ruck.id}`}
                    className="p-4 rounded-2xl bg-gradient-to-r from-[#141d27] to-[#182330] border-2 border-amber-500/40 hover:border-amber-400 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-700/60">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-400 text-black flex items-center gap-1">
                          <Footprints className="w-3 h-3" />
                          Ruck Session
                        </span>
                        <h3 className="font-black text-white text-sm sm:text-base">
                          {ruck.title}
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">
                          {ruck.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {ruck.terrain || 'Pavement'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Delete this ruck log entry?')) {
                              onDeleteRuckLog(ruck.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete ruck session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Ruck Session Performance Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      <div className="bg-black/30 rounded-xl p-2 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pack Load</span>
                        <span className="font-black text-amber-400 text-sm font-mono">{ruck.weightLbs} lbs</span>
                      </div>

                      <div className="bg-black/30 rounded-xl p-2 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Distance</span>
                        <span className="font-black text-emerald-400 text-sm font-mono">{ruck.distanceMiles} mi</span>
                      </div>

                      <div className="bg-black/30 rounded-xl p-2 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Time</span>
                        <span className="font-black text-white text-sm font-mono">{ruck.durationMinutes} min</span>
                      </div>

                      <div className="bg-black/30 rounded-xl p-2 border border-zinc-800/80">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Pace</span>
                        <span className="font-black text-cyan-400 text-sm font-mono">{formatRuckPace(pace)} /mi</span>
                      </div>

                      <div className="bg-black/30 rounded-xl p-2 border border-zinc-800/80 col-span-2 sm:col-span-1">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Workload</span>
                        <span className="font-black text-amber-300 text-sm font-mono">{Math.round(workload)} lb-mi</span>
                      </div>
                    </div>

                    {ruck.notes && (
                      <div className="mt-2 text-xs text-zinc-300 italic bg-black/20 rounded-lg px-3 py-1.5 border border-zinc-800">
                        "{ruck.notes}"
                      </div>
                    )}
                  </div>
                );
              } else {
                const gym = item.data;
                return (
                  <div
                    key={`gym-${gym.id}`}
                    className="p-4 rounded-2xl bg-[#141b24] border border-zinc-800 hover:border-zinc-700 transition-all shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1">
                          <Dumbbell className="w-3 h-3 text-amber-400" />
                          Gym Strength
                        </span>
                        <h3 className="font-black text-white text-sm sm:text-base">
                          {gym.workoutTitle}
                        </h3>
                        <span className="text-xs text-zinc-400 font-mono">
                          {gym.date}
                        </span>
                      </div>

                      <span className="text-xs text-zinc-400">
                        {gym.exercises.length} Exercises • {gym.totalSetsCompleted} Sets
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-black/20 rounded-xl p-2 border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Volume</span>
                        <span className="font-black text-white text-sm font-mono">{gym.totalVolumeLbs.toLocaleString()} lbs</span>
                      </div>

                      <div className="bg-black/20 rounded-xl p-2 border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Duration</span>
                        <span className="font-black text-zinc-300 text-sm font-mono">{gym.durationMinutes} min</span>
                      </div>

                      <div className="bg-black/20 rounded-xl p-2 border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Exercises</span>
                        <span className="font-black text-zinc-300 text-sm font-mono">{gym.exercises.length} movements</span>
                      </div>

                      <div className="bg-black/20 rounded-xl p-2 border border-zinc-800">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 block">Sets Completed</span>
                        <span className="font-black text-amber-400 text-sm font-mono">{gym.totalSetsCompleted} sets</span>
                      </div>
                    </div>

                    {/* Exercise List preview */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {gym.exercises.slice(0, 5).map((ex, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300"
                        >
                          {ex.exerciseName}
                        </span>
                      ))}
                      {gym.exercises.length > 5 && (
                        <span className="text-[11px] text-zinc-500 py-0.5 px-1">
                          +{gym.exercises.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              }
            })
          ) : (
            <div className="text-center py-12 px-4 bg-zinc-950/40 rounded-3xl border border-zinc-800 text-zinc-400">
              <Footprints className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
              <h4 className="text-base font-bold text-white mb-1">
                {athleteFilter === 'current' ? `New Logbook for ${currentAthlete.name}` : 'Fresh Logbook'}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto mb-4">
                Everyone starts with a clean slate of new logs until they record their own. Click below to log your first ruck or start a gym session.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:from-amber-400 hover:to-amber-500 transition-all"
                >
                  Log First Ruck
                </button>
                {onNavigateToWorkoutLogs && (
                  <button
                    type="button"
                    onClick={onNavigateToWorkoutLogs}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded-xl border border-zinc-700 transition-all cursor-pointer"
                  >
                    Go to Workout Logs
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
