import React from 'react';
import { Zap, Clock, Timer, CheckCircle2, Pause, Play, X, ShieldCheck, Flame } from 'lucide-react';
import { parseCircuitDetails, CircuitInfo } from '../utils/circuitParser';

interface TacticalCircuitCardProps {
  exercise: any;
  index: number;
  activeTimer?: {
    exerciseName: string;
    secondsRemaining: number;
    isRunning: boolean;
  } | null;
  onToggleTimer?: (exerciseName: string, defaultSecs: number) => void;
  onAdjustTimer?: (delta: number) => void;
  onStopTimer?: () => void;
}

export const TacticalCircuitCard: React.FC<TacticalCircuitCardProps> = ({
  exercise,
  index,
  activeTimer,
  onToggleTimer,
  onAdjustTimer,
  onStopTimer,
}) => {
  const circuit: CircuitInfo = parseCircuitDetails(exercise);
  const isTimerActive = activeTimer && activeTimer.exerciseName === circuit.circuitName;

  return (
    <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-[#161208] via-[#0c101c] to-[#080d1a] shadow-xl overflow-hidden transition-all duration-200 hover:border-amber-400">
      {/* Circuit Header Bar */}
      <div className="px-4 py-3 bg-amber-500/15 border-b border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="w-6 h-6 rounded-lg bg-amber-500 text-black font-mono text-xs font-black flex items-center justify-center shrink-0 shadow-sm">
            {index + 1}
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-amber-500/50">
              <Zap className="w-3 h-3 fill-amber-300" />
              <span>Metabolic Circuit</span>
            </span>
            <span className="text-white font-black font-athletic text-sm sm:text-base uppercase tracking-wide">
              {circuit.circuitName}
            </span>
          </div>
        </div>

        {/* Prescription Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-mono font-black text-xs uppercase shadow-sm">
            {circuit.rounds} Rounds
          </span>
          <span className="px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
            {circuit.workRestScheme}
          </span>
          <span className="px-2 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono font-bold text-xs">
            RPE {circuit.targetRpe}
          </span>
        </div>
      </div>

      {/* Main Content Area: Stations Grid */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Stations Intro Cue */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider font-athletic">
            <Flame className="w-3.5 h-3.5" />
            <span>Prescribed Circuit Stations ({circuit.stations.length} Movements)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {circuit.restBetweenRoundsSeconds}s Rest Between Rounds
          </span>
        </div>

        {/* Stations Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {circuit.stations.map((st) => (
            <div
              key={st.number}
              className="p-3 rounded-xl bg-[#090f1e] border border-amber-500/25 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-1.5 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  Station {st.number}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Round 1-{circuit.rounds}
                </span>
              </div>
              <h5 className="font-bold text-white text-xs sm:text-sm font-athletic tracking-wide leading-snug group-hover:text-amber-200 transition-colors">
                {st.name}
              </h5>
              <div className="text-[10px] font-mono text-slate-400">
                Continuous tempo · zero station delay
              </div>
            </div>
          ))}
        </div>

        {/* Execution Directions & Rest Timer Controls */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-slate-300 italic flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{circuit.executionCue}</span>
          </p>

          {/* Round Rest Timer Controller */}
          {onToggleTimer && (
            <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Round Recovery:
              </span>
              {isTimerActive ? (
                <div className="flex items-center gap-1 bg-[#0b1222] border border-amber-500/70 shadow-lg rounded-xl p-1 animate-in fade-in">
                  {onAdjustTimer && (
                    <button
                      type="button"
                      onClick={() => onAdjustTimer(-15)}
                      className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      -15
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onToggleTimer(circuit.circuitName, circuit.restBetweenRoundsSeconds)}
                    className={`flex items-center gap-1 px-2.5 py-1 font-mono text-xs font-black rounded-lg transition-all cursor-pointer ${
                      activeTimer.secondsRemaining === 0
                        ? 'bg-emerald-500 text-black animate-pulse'
                        : activeTimer.isRunning
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/40'
                        : 'bg-slate-800 text-amber-300'
                    }`}
                  >
                    {activeTimer.secondsRemaining === 0 ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ROUND REST COMPLETE</span>
                      </span>
                    ) : (
                      <>
                        {activeTimer.isRunning ? (
                          <Pause className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        )}
                        <span>{activeTimer.secondsRemaining}s</span>
                      </>
                    )}
                  </button>
                  {onAdjustTimer && (
                    <button
                      type="button"
                      onClick={() => onAdjustTimer(15)}
                      className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                    >
                      +15
                    </button>
                  )}
                  {onStopTimer && (
                    <button
                      type="button"
                      onClick={onStopTimer}
                      className="p-1 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onToggleTimer(circuit.circuitName, circuit.restBetweenRoundsSeconds)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-950/60 text-amber-300 hover:text-white border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Start {circuit.restBetweenRoundsSeconds}s Round Rest</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
