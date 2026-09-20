import React, { useState, useMemo } from 'react';
import { 
  Activity, Heart, Timer, Zap, ArrowRight, Gauge, 
  RotateCcw, Sliders, ChevronRight, CheckCircle2, 
  Flame, Compass, Clock, Info, ShieldCheck
} from 'lucide-react';

interface SplitRow {
  marker: string;
  splitTime: string;
  cumulativeTime: string;
}

export const RunPaceHrCalculator: React.FC = () => {
  // Mode: 'pace' (calc pace from dist+time), 'time' (calc time from dist+pace), 'distance' (calc dist from time+pace)
  const [calcMode, setCalcMode] = useState<'pace' | 'time' | 'distance'>('pace');

  // Distance state
  const [distanceVal, setDistanceVal] = useState<string>('3.0');
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'km'>('miles');

  // Time state (hours, minutes, seconds)
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(24);
  const [seconds, setSeconds] = useState<number>(0);

  // Pace state (minutes, seconds per mile or km)
  const [paceMinutes, setPaceMinutes] = useState<number>(8);
  const [paceSeconds, setPaceSeconds] = useState<number>(0);
  const [paceUnit, setPaceUnit] = useState<'min/mile' | 'min/km'>('min/mile');

  // Heart Rate Calculator State
  const [age, setAge] = useState<number>(25);
  const [restingHr, setRestingHr] = useState<number>(54);
  const [customMaxHr, setCustomMaxHr] = useState<string>('');
  const [hrFormula, setHrFormula] = useState<'karvonen' | 'tanaka' | 'standard'>('karvonen');
  const [currentTestHr, setCurrentTestHr] = useState<number>(138);

  // Presets
  const distancePresets = [
    { label: '400m Track', val: 0.2485, unit: 'miles' as const },
    { label: '800m Repeats', val: 0.4971, unit: 'miles' as const },
    { label: '1.0 Mile Peaking', val: 1.0, unit: 'miles' as const },
    { label: '3.0 Mi Zone 2', val: 3.0, unit: 'miles' as const },
    { label: '5K (3.11 mi)', val: 3.10686, unit: 'miles' as const },
    { label: '5.0 Mi Ruck', val: 5.0, unit: 'miles' as const },
    { label: '10K (6.21 mi)', val: 6.21371, unit: 'miles' as const },
    { label: '7.0 Mi Long Run', val: 7.0, unit: 'miles' as const },
    { label: 'Half Marathon', val: 13.1094, unit: 'miles' as const },
    { label: 'Marathon', val: 26.2188, unit: 'miles' as const },
  ];

  // Calculations for Pace / Time / Distance
  const totalTimeSeconds = useMemo(() => {
    return hours * 3600 + minutes * 60 + seconds;
  }, [hours, minutes, seconds]);

  const totalPaceSeconds = useMemo(() => {
    return paceMinutes * 60 + paceSeconds;
  }, [paceMinutes, paceSeconds]);

  const parsedDistanceMiles = useMemo(() => {
    const dist = parseFloat(distanceVal) || 0;
    return distanceUnit === 'miles' ? dist : dist * 0.621371;
  }, [distanceVal, distanceUnit]);

  const parsedDistanceKm = useMemo(() => {
    const dist = parseFloat(distanceVal) || 0;
    return distanceUnit === 'km' ? dist : dist * 1.60934;
  }, [distanceVal, distanceUnit]);

  // Derived output based on calculation mode
  const results = useMemo(() => {
    let outPaceSecPerMile = 0;
    let outPaceSecPerKm = 0;
    let outTimeSec = 0;
    let outDistMiles = 0;
    let outDistKm = 0;
    let speedMph = 0;
    let speedKph = 0;

    if (calcMode === 'pace') {
      if (parsedDistanceMiles > 0 && totalTimeSeconds > 0) {
        outPaceSecPerMile = totalTimeSeconds / parsedDistanceMiles;
        outPaceSecPerKm = totalTimeSeconds / parsedDistanceKm;
        speedMph = parsedDistanceMiles / (totalTimeSeconds / 3600);
        speedKph = parsedDistanceKm / (totalTimeSeconds / 3600);
      }
      outTimeSec = totalTimeSeconds;
      outDistMiles = parsedDistanceMiles;
      outDistKm = parsedDistanceKm;
    } else if (calcMode === 'time') {
      const pacePerMileSec = paceUnit === 'min/mile' ? totalPaceSeconds : totalPaceSeconds * 1.60934;
      outTimeSec = pacePerMileSec * parsedDistanceMiles;
      outPaceSecPerMile = pacePerMileSec;
      outPaceSecPerKm = pacePerMileSec / 1.60934;
      if (outTimeSec > 0) {
        speedMph = parsedDistanceMiles / (outTimeSec / 3600);
        speedKph = parsedDistanceKm / (outTimeSec / 3600);
      }
      outDistMiles = parsedDistanceMiles;
      outDistKm = parsedDistanceKm;
    } else {
      // distance mode
      const pacePerMileSec = paceUnit === 'min/mile' ? totalPaceSeconds : totalPaceSeconds * 1.60934;
      if (pacePerMileSec > 0 && totalTimeSeconds > 0) {
        outDistMiles = totalTimeSeconds / pacePerMileSec;
        outDistKm = outDistMiles * 1.60934;
        outPaceSecPerMile = pacePerMileSec;
        outPaceSecPerKm = pacePerMileSec / 1.60934;
        speedMph = outDistMiles / (totalTimeSeconds / 3600);
        speedKph = outDistKm / (totalTimeSeconds / 3600);
      }
      outTimeSec = totalTimeSeconds;
    }

    const formatTime = (secs: number) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.round(secs % 60);
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatPace = (secs: number) => {
      if (!isFinite(secs) || secs <= 0) return '--:--';
      const m = Math.floor(secs / 60);
      const s = Math.round(secs % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return {
      pacePerMile: formatPace(outPaceSecPerMile),
      pacePerKm: formatPace(outPaceSecPerKm),
      totalTimeFormatted: formatTime(outTimeSec),
      speedMph: speedMph > 0 ? speedMph.toFixed(1) : '0.0',
      speedKph: speedKph > 0 ? speedKph.toFixed(1) : '0.0',
      calculatedMiles: outDistMiles.toFixed(2),
      calculatedKm: outDistKm.toFixed(2),
      paceSecPerMile: outPaceSecPerMile,
    };
  }, [calcMode, parsedDistanceMiles, parsedDistanceKm, totalTimeSeconds, totalPaceSeconds, paceUnit]);

  // Splits generator up to 10 miles or km
  const splitRows = useMemo<SplitRow[]>(() => {
    if (!results.paceSecPerMile || results.paceSecPerMile <= 0) return [];

    const isMiles = distanceUnit === 'miles';
    const totalDist = isMiles ? parseFloat(results.calculatedMiles) : parseFloat(results.calculatedKm);
    const splitSecs = isMiles ? results.paceSecPerMile : results.paceSecPerMile / 1.60934;
    
    if (totalDist <= 0 || !isFinite(splitSecs)) return [];

    const rows: SplitRow[] = [];
    const limit = Math.min(Math.ceil(totalDist), 15);

    for (let i = 1; i <= limit; i++) {
      const currDist = i > totalDist ? totalDist : i;
      const cumSecs = currDist * splitSecs;

      const formatSplit = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.round(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
      };

      const formatCum = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = Math.round(secs % 60);
        if (h > 0) {
          return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
      };

      rows.push({
        marker: `${isMiles ? 'Mile' : 'Km'} ${i}${i > totalDist ? ` (${totalDist.toFixed(1)})` : ''}`,
        splitTime: formatSplit(splitSecs),
        cumulativeTime: formatCum(cumSecs),
      });

      if (i >= totalDist) break;
    }

    return rows;
  }, [results, distanceUnit]);

  // Heart Rate calculations
  const maxHeartRate = useMemo(() => {
    if (customMaxHr && !isNaN(parseInt(customMaxHr, 10))) {
      return parseInt(customMaxHr, 10);
    }
    if (hrFormula === 'tanaka') {
      return Math.round(208 - 0.7 * age);
    }
    return Math.round(220 - age);
  }, [age, customMaxHr, hrFormula]);

  const hrReserve = useMemo(() => {
    return Math.max(0, maxHeartRate - restingHr);
  }, [maxHeartRate, restingHr]);

  interface ZoneInfo {
    zone: number;
    name: string;
    label: string;
    minPercent: number;
    maxPercent: number;
    minBpm: number;
    maxBpm: number;
    rpe: string;
    color: string;
    bgColor: string;
    borderColor: string;
    desc: string;
    coachStandard?: boolean;
  }

  const zones = useMemo<ZoneInfo[]>(() => {
    const isKarvonen = hrFormula === 'karvonen';

    const getBpm = (pct: number) => {
      if (isKarvonen) {
        return Math.round(restingHr + (hrReserve * (pct / 100)));
      }
      return Math.round(maxHeartRate * (pct / 100));
    };

    return [
      {
        zone: 1,
        name: 'Zone 1: Active Recovery',
        label: 'Recovery & Blood Flow',
        minPercent: 50,
        maxPercent: 60,
        minBpm: getBpm(50),
        maxBpm: getBpm(60),
        rpe: 'RPE 1-2',
        color: 'text-sky-400',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/30',
        desc: 'Light flush, post-leg day recovery walks, gentle warm-ups, restores parasympathetic nervous system.',
      },
      {
        zone: 2,
        name: 'Zone 2: Aerobic Foundation',
        label: "Coach AJ's Base Standard",
        minPercent: 60,
        maxPercent: 70,
        minBpm: getBpm(60),
        maxBpm: getBpm(70),
        rpe: 'RPE 3-4',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/15',
        borderColor: 'border-emerald-500/50',
        desc: 'Strictly conversational. Expands mitochondrial density and capillary beds to clear lactate during heavy compound lifts.',
        coachStandard: true,
      },
      {
        zone: 3,
        name: 'Zone 3: Tempo / Aerobic Power',
        label: 'Steady State Stamina',
        minPercent: 70,
        maxPercent: 80,
        minBpm: getBpm(70),
        maxBpm: getBpm(80),
        rpe: 'RPE 5-6',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        desc: 'Comfortable endurance pacing. Requires moderate focus, sentences become fragmented.',
      },
      {
        zone: 4,
        name: 'Zone 4: Lactate Threshold',
        label: 'Threshold & 5K Peaking',
        minPercent: 80,
        maxPercent: 90,
        minBpm: getBpm(80),
        maxBpm: getBpm(90),
        rpe: 'RPE 7-8.5',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        desc: 'Comfortably hard. Improves lactate clearance at race paces (400m-800m repeats, 5K threshold tempos).',
      },
      {
        zone: 5,
        name: 'Zone 5: Anaerobic / VO2 Max',
        label: 'Max Effort Intervals',
        minPercent: 90,
        maxPercent: 100,
        minBpm: getBpm(90),
        maxBpm: getBpm(100),
        rpe: 'RPE 9-10',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/15',
        borderColor: 'border-amber-500/50',
        desc: 'All-out anaerobic capacity, sprint repeats (10x200m / hill bounds). Sustainable only for short bursts.',
      },
    ];
  }, [hrFormula, restingHr, hrReserve, maxHeartRate]);

  // Current Tested HR analysis
  const currentZoneMatch = useMemo(() => {
    if (!currentTestHr || currentTestHr < 40) return null;
    const match = zones.find(z => currentTestHr >= z.minBpm && currentTestHr <= z.maxBpm);
    if (match) return match;
    if (currentTestHr > zones[zones.length - 1].maxBpm) {
      return { ...zones[zones.length - 1], name: 'Above Zone 5 (Supramaximal)' };
    }
    return { ...zones[0], name: 'Below Zone 1 (Resting / Passive)' };
  }, [currentTestHr, zones]);

  return (
    <div className="space-y-8">
      {/* Top Banner: Run Pace & Heart Rate Suite */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider">
                Endurance & Aerobic Engine
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                Coach AJ&apos;s Zone 2 Standard
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-white font-athletic flex items-center gap-2.5">
              <Timer className="w-7 h-7 text-amber-400" />
              Run Pace &amp; <span className="text-amber-400">Heart Rate</span> Calculator
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Calculate exact min/mile paces, target finish splits, and precise physiological heart rate zones (Karvonen HRR &amp; MHR models) for Zone 2 base runs, interval repeats, and tactical rucking.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400 font-bold px-2">Solve For:</span>
            {[
              { id: 'pace', label: 'Pace' },
              { id: 'time', label: 'Finish Time' },
              { id: 'distance', label: 'Distance' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setCalcMode(mode.id as 'pace' | 'time' | 'distance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  calcMode === mode.id
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 1: RUN & RUCK PACE SOLVER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Column */}
        <div className="lg:col-span-6 space-y-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white font-athletic">
                Pace Parameters
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              Mode: <strong className="text-amber-400 uppercase">{calcMode}</strong>
            </span>
          </div>

          {/* Quick Distance Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Quick Distance Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {distancePresets.map((preset) => {
                const isSelected = Math.abs(parseFloat(distanceVal) - preset.val) < 0.05 && distanceUnit === preset.unit;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDistanceVal(preset.val.toString());
                      setDistanceUnit(preset.unit);
                    }}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span className="block truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distance Input (shown in pace and time mode) */}
          {calcMode !== 'distance' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Target Distance
                </label>
                <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setDistanceUnit('miles')}
                    className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer ${
                      distanceUnit === 'miles' ? 'bg-amber-500 text-black font-black' : 'text-zinc-400'
                    }`}
                  >
                    Miles
                  </button>
                  <button
                    type="button"
                    onClick={() => setDistanceUnit('km')}
                    className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer ${
                      distanceUnit === 'km' ? 'bg-amber-500 text-black font-black' : 'text-zinc-400'
                    }`}
                  >
                    KM
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={distanceVal}
                onChange={(e) => setDistanceVal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none transition-colors"
                placeholder="e.g. 3.0"
              />
            </div>
          )}

          {/* Time Inputs (shown in pace and distance mode) */}
          {calcMode !== 'time' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Elapsed / Target Time (HH:MM:SS)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Hours</span>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-center text-sm font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Minutes</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-center text-sm font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Seconds</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-center text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Pace Inputs (shown in time and distance mode) */}
          {calcMode !== 'pace' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Target Pace (MM:SS)
                </label>
                <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaceUnit('min/mile')}
                    className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer ${
                      paceUnit === 'min/mile' ? 'bg-amber-500 text-black font-black' : 'text-zinc-400'
                    }`}
                  >
                    /mile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaceUnit('min/km')}
                    className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer ${
                      paceUnit === 'min/km' ? 'bg-amber-500 text-black font-black' : 'text-zinc-400'
                    }`}
                  >
                    /km
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Pace Minutes</span>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    value={paceMinutes}
                    onChange={(e) => setPaceMinutes(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-center text-sm font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Pace Seconds</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={paceSeconds}
                    onChange={(e) => setPaceSeconds(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-center text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Ruck & Running Standards reference */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
            <span className="font-bold text-zinc-200 block text-[11px] uppercase tracking-wider font-athletic">
              Coach AJ&apos;s Hybrid Pacing Benchmarks
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-zinc-500">Zone 2 Aerobic:</span>{' '}
                <span className="text-emerald-400 font-mono font-bold">8:30 - 10:30 /mi</span>
              </div>
              <div>
                <span className="text-zinc-500">Threshold Tempo:</span>{' '}
                <span className="text-amber-400 font-mono font-bold">6:45 - 7:30 /mi</span>
              </div>
              <div>
                <span className="text-zinc-500">5K Race Peaking:</span>{' '}
                <span className="text-amber-400 font-mono font-bold">6:00 - 7:00 /mi</span>
              </div>
              <div>
                <span className="text-zinc-500">Tactical Ruck (35-45 lb):</span>{' '}
                <span className="text-sky-400 font-mono font-bold">&lt; 14:30 /mi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Output Column: Calculated Metrics & Split Card */}
        <div className="lg:col-span-6 space-y-5 flex flex-col">
          {/* Main Primary Metrics Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Calculated Results
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  {results.speedMph} MPH / {results.speedKph} KM/H
                </span>
              </div>

              {/* Big Primary Metric */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Mile Pace</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                    {results.pacePerMile}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">min / mile</span>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">KM Pace</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-zinc-300 mt-1">
                    {results.pacePerKm}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">min / km</span>
                </div>

                <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Time</span>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
                    {results.totalTimeFormatted}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    for {results.calculatedMiles} mi ({results.calculatedKm} km)
                  </span>
                </div>
              </div>
            </div>

            {/* Mile / KM Cumulative Splits Table */}
            {splitRows.length > 0 && (
              <div className="mt-5 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Split Progression ({distanceUnit})
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">Cumulative Elapsed</span>
                </div>

                <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                  {splitRows.map((row, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-zinc-950 rounded-lg text-xs font-mono border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                    >
                      <span className="text-zinc-300 font-bold">{row.marker}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-500">{row.splitTime}/split</span>
                        <span className="text-amber-400 font-bold">{row.cumulativeTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: HEART RATE TRAINING ZONES & KARVONEN CALCULATOR */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white font-athletic">
                Heart Rate Zones &amp; Karvonen HRR Engine
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculate your customized physiological training zones to dial in strict Zone 2 conversational runs.
              </p>
            </div>
          </div>

          {/* Formula Model Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            {[
              { id: 'karvonen', label: 'Karvonen HRR (Recommended)' },
              { id: 'tanaka', label: 'Tanaka (208 - 0.7×Age)' },
              { id: 'standard', label: 'Standard (220 - Age)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setHrFormula(f.id as 'karvonen' | 'tanaka' | 'standard')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  hrFormula === f.id
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Bar: Age, Resting HR, Custom Max HR */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Athlete Age (Years)
            </label>
            <input
              type="number"
              min="14"
              max="90"
              value={age}
              onChange={(e) => setAge(Math.max(14, Math.min(90, parseInt(e.target.value, 10) || 25)))}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Resting Heart Rate (BPM)
            </label>
            <input
              type="number"
              min="35"
              max="110"
              value={restingHr}
              onChange={(e) => setRestingHr(Math.max(35, Math.min(110, parseInt(e.target.value, 10) || 60)))}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white outline-none"
              placeholder="e.g. 54"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Max HR Override (Optional)
            </label>
            <input
              type="number"
              min="120"
              max="230"
              value={customMaxHr}
              onChange={(e) => setCustomMaxHr(e.target.value)}
              placeholder={`Auto: ${maxHeartRate} bpm`}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-zinc-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Calculated Max HR / Reserve
            </label>
            <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono">
              <span className="text-white font-bold">{maxHeartRate} BPM Max</span>{' '}
              <span className="text-zinc-500">({hrReserve} Reserve)</span>
            </div>
          </div>
        </div>

        {/* Live HR Checker Slider */}
        <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
              Live Workout Heart Rate Gauge
            </span>
            <p className="text-[11px] text-zinc-500 leading-tight">
              Test your current heart rate against Coach AJ&apos;s protocol zones.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
            <input
              type="range"
              min="70"
              max={maxHeartRate}
              value={currentTestHr}
              onChange={(e) => setCurrentTestHr(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-lg font-black text-white w-20 text-right">
              {currentTestHr} <span className="text-xs font-normal text-zinc-400">BPM</span>
            </span>
          </div>

          {currentZoneMatch && (
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${currentZoneMatch.bgColor} ${currentZoneMatch.borderColor} ${currentZoneMatch.color}`}>
              {currentZoneMatch.name}
            </div>
          )}
        </div>

        {/* 5 Heart Rate Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {zones.map((z) => {
            const isHighlighted = currentTestHr >= z.minBpm && currentTestHr <= z.maxBpm;
            return (
              <div
                key={z.zone}
                className={`rounded-2xl p-4 border flex flex-col justify-between transition-all ${
                  z.coachStandard
                    ? 'border-emerald-500/60 bg-emerald-950/20 ring-1 ring-emerald-500/40 shadow-lg'
                    : isHighlighted
                    ? `${z.borderColor} ${z.bgColor} ring-1 ring-amber-500/40`
                    : 'bg-zinc-950 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${z.color}`}>
                      Zone {z.zone}
                    </span>
                    {z.coachStandard && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/30 text-emerald-300 rounded text-[9px] font-mono font-black uppercase">
                        Coach Standard
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    {z.label}
                  </h4>

                  <div className="my-2.5 p-2 bg-zinc-900 rounded-xl border border-zinc-800/80">
                    <div className="text-lg font-black font-mono text-white">
                      {z.minBpm} - {z.maxBpm}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      BPM ({z.minPercent}% - {z.maxPercent}%)
                    </span>
                  </div>

                  <span className="inline-block text-[11px] font-bold text-zinc-300 font-mono bg-zinc-800/80 px-2 py-0.5 rounded-md mb-2">
                    {z.rpe}
                  </span>

                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {z.desc}
                  </p>
                </div>

                {z.coachStandard && (
                  <div className="mt-3 pt-2 border-t border-emerald-500/30 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Nasal breathing &amp; conversational pace</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
