import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, User, UserCheck, Dumbbell, Calendar, 
  Plus, Trash2, Edit3, CheckCircle2, AlertCircle, FileText, 
  Send, Sparkles, ChevronRight, Lock, Eye, RefreshCw, X,
  BadgeAlert, Clock, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { AthleteProfile, OfficerAssignedProgram, ExerciseTemplate, WorkoutProgram } from '../types';
import { 
  subscribeToOfficerProgram, 
  subscribeToAllOfficerPrograms, 
  subscribeToAllAthletes,
  saveOfficerProgramToFirestore,
  deleteOfficerProgramFromFirestore
} from '../utils/firebaseSync';
import { isCoachSession } from '../utils/athleteAuth';

interface OfficerPortalTabProps {
  currentAthlete: AthleteProfile;
  onStartCustomWorkout?: (program: WorkoutProgram) => void;
  onOpenPricingModal?: () => void;
}

export const OfficerPortalTab: React.FC<OfficerPortalTabProps> = ({
  currentAthlete,
  onStartCustomWorkout,
  onOpenPricingModal,
}) => {
  const { user } = useFirebase();

  // Determine if viewer is Coach AJ / Administrator
  const isCoachOrAdmin = 
    user?.email === 'risneraryan@gmail.com' ||
    user?.email === 'risnerathletics@gmail.com' ||
    isCoachSession();

  // State for the logged-in officer's individual assigned program
  const [officerProgram, setOfficerProgram] = useState<OfficerAssignedProgram | null>(null);
  const [loadingOfficerProg, setLoadingOfficerProg] = useState<boolean>(true);

  // Admin / Coach management state
  const [allOfficers, setAllOfficers] = useState<AthleteProfile[]>([]);
  const [allAssignedPrograms, setAllAssignedPrograms] = useState<OfficerAssignedProgram[]>([]);
  const [selectedTargetOfficer, setSelectedTargetOfficer] = useState<AthleteProfile | null>(null);

  // Upload modal / form state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload Form Fields
  const [progTitle, setProgTitle] = useState('');
  const [progSubtitle, setProgSubtitle] = useState('');
  const [progCategory, setProgCategory] = useState<OfficerAssignedProgram['category']>('Tactical & Rucking');
  const [progFrequency, setProgFrequency] = useState('4 Days / Week');
  const [progDuration, setProgDuration] = useState('60');
  const [progNotes, setProgNotes] = useState('');
  const [badgeNumberInput, setBadgeNumberInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState('Patrol Division');

  // Days list for schedule builder
  const [scheduleDays, setScheduleDays] = useState<Array<{
    day: number;
    dayLabel: string;
    focus: string;
    warmup: string;
    exercises: ExerciseTemplate[];
    runPacing?: string;
    coachNotes?: string;
  }>>([
    {
      day: 1,
      dayLabel: 'Day 1: Duty Strength & Armor',
      focus: 'Lower Body Strength & Combat Chassis',
      warmup: '5 min dynamic flow, hip openers, glute activation',
      exercises: [
        {
          id: 'ex-1',
          name: 'Front Squat (Duty Core Stance)',
          muscleGroup: 'Quads',
          defaultSets: 4,
          targetReps: '6-8 reps',
          targetRpe: 8,
          restPeriodSeconds: 120,
          notes: 'Keep torso upright like wearing plate carrier.',
        },
        {
          id: 'ex-2',
          name: 'Romanian Deadlift',
          muscleGroup: 'Hamstrings & Glutes',
          defaultSets: 3,
          targetReps: '8-10 reps',
          targetRpe: 7,
          restPeriodSeconds: 90,
          notes: 'Feel deep hamstring hinge stretch.',
        },
      ],
      runPacing: 'Zone 2 / Conversational recovery',
      coachNotes: 'Focus on explosive hip drive on every rep.',
    },
    {
      day: 2,
      dayLabel: 'Day 2: Pursuit & Upper Armor',
      focus: 'Upper Push/Pull & Tactical Conditioning',
      warmup: 'Band pull-aparts, shoulder dislocates, push-up walks',
      exercises: [
        {
          id: 'ex-3',
          name: 'Barbell Incline Press',
          muscleGroup: 'Chest',
          defaultSets: 4,
          targetReps: '8 reps',
          targetRpe: 8,
          restPeriodSeconds: 90,
          notes: 'Upper chest armor for vest comfort.',
        },
        {
          id: 'ex-4',
          name: 'Weighted Neutral Pull-Ups',
          muscleGroup: 'Back',
          defaultSets: 4,
          targetReps: '6 reps',
          targetRpe: 8,
          restPeriodSeconds: 90,
          notes: 'Strict lockout at top.',
        },
      ],
      runPacing: 'Sprint intervals: 6 x 60m sprints',
      coachNotes: 'Pursuit acceleration burst focus.',
    },
  ]);

  // Active view tab for the officer (e.g. Schedule Day 1, Day 2, etc.)
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // 1. Subscribe to the logged-in officer's individual program
  useEffect(() => {
    if (!user) {
      setLoadingOfficerProg(false);
      return;
    }
    const unsub = subscribeToOfficerProgram(user.uid, (prog) => {
      setOfficerProgram(prog);
      setLoadingOfficerProg(false);
    });
    return () => unsub();
  }, [user]);

  // 2. If coach/admin, subscribe to all officers and all assigned programs
  useEffect(() => {
    if (!isCoachOrAdmin) return;

    const unsubOfficers = subscribeToAllAthletes((athletes) => {
      setAllOfficers(athletes);
      if (!selectedTargetOfficer && athletes.length > 0) {
        // Default target officer to first non-coach officer if available
        const firstOfficer = athletes.find((a) => a.id !== user?.uid) || athletes[0];
        setSelectedTargetOfficer(firstOfficer);
      }
    });

    const unsubPrograms = subscribeToAllOfficerPrograms((programs) => {
      setAllAssignedPrograms(programs);
    });

    return () => {
      unsubOfficers();
      unsubPrograms();
    };
  }, [isCoachOrAdmin, user]);

  const handleOpenUploadModal = (target?: AthleteProfile, existingProg?: OfficerAssignedProgram) => {
    if (target) {
      setSelectedTargetOfficer(target);
    }
    if (existingProg) {
      setEditingProgramId(existingProg.id);
      setProgTitle(existingProg.programTitle);
      setProgSubtitle(existingProg.programSubtitle || '');
      setProgCategory(existingProg.category);
      setProgFrequency(existingProg.frequency || '4 Days / Week');
      setProgDuration(String(existingProg.estimatedDurationMinutes || 60));
      setProgNotes(existingProg.coachNotes || '');
      setBadgeNumberInput(existingProg.badgeNumber || '');
      setDepartmentInput(existingProg.department || 'Patrol Division');
      if (existingProg.scheduleDays && existingProg.scheduleDays.length > 0) {
        setScheduleDays(existingProg.scheduleDays.map((d, i) => ({
          day: d.day || i + 1,
          dayLabel: d.dayLabel || `Day ${i + 1}`,
          focus: d.focus || 'Training Session',
          warmup: d.warmup || '',
          exercises: d.exercises || [],
          runPacing: d.runPacing,
          coachNotes: d.coachNotes,
        })));
      }
    } else {
      setEditingProgramId(null);
      setProgTitle(`Officer ${target?.name || 'Custom'} Duty Protocol`);
      setProgSubtitle('Tailored Duty Strength, Pursuit Speed & Body Armor Protocol');
      setProgCategory('Tactical & Rucking');
      setProgFrequency('4 Days / Week');
      setProgDuration('60');
      setProgNotes('Prescribed individually for your shift schedule, physical test goals, and joint mobility.');
      setBadgeNumberInput('');
      setDepartmentInput('Patrol Division');
    }
    setIsUploadModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetOfficer) {
      setFeedbackMsg({ type: 'error', text: 'Please select an officer to assign this program to.' });
      return;
    }
    if (!progTitle.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter a program title.' });
      return;
    }

    try {
      setSubmitting(true);
      const programId = editingProgramId || `prog-officer-${Date.now()}`;
      
      // Flatten all exercises across days for root compatibility
      const allExercises: ExerciseTemplate[] = scheduleDays.flatMap((d) => d.exercises);

      const payload: OfficerAssignedProgram = {
        id: programId,
        officerUserId: selectedTargetOfficer.id, // Scoped specifically to this officer account
        officerEmail: selectedTargetOfficer.email,
        officerName: selectedTargetOfficer.name,
        badgeNumber: badgeNumberInput.trim() || undefined,
        department: departmentInput.trim() || undefined,
        programTitle: progTitle.trim(),
        programSubtitle: progSubtitle.trim() || undefined,
        category: progCategory,
        frequency: progFrequency.trim() || '4 Days / Week',
        estimatedDurationMinutes: Number(progDuration) || 60,
        coachNotes: progNotes.trim() || undefined,
        scheduleDays,
        exercises: allExercises,
        assignedByEmail: user?.email || 'risnerathletics@gmail.com',
        assignedAt: new Date().toISOString(),
      };

      await saveOfficerProgramToFirestore(payload);
      setFeedbackMsg({ 
        type: 'success', 
        text: `Program successfully uploaded to Officer ${selectedTargetOfficer.name}'s portal!` 
      });
      setIsUploadModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to save officer program:', err);
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to upload program to Firestore.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgram = async (programId: string, officerName: string) => {
    if (!window.confirm(`Are you sure you want to remove the assigned program for Officer ${officerName}?`)) {
      return;
    }
    try {
      await deleteOfficerProgramFromFirestore(programId);
      setFeedbackMsg({ type: 'success', text: `Program for Officer ${officerName} deleted.` });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to delete program.' });
    }
  };

  const handleStartAssignedWorkout = (dayPlan: typeof scheduleDays[0]) => {
    if (!onStartCustomWorkout) return;
    const workoutProg: WorkoutProgram = {
      id: `live-officer-${dayPlan.day}-${Date.now()}`,
      title: `${officerProgram?.programTitle || 'Individual Program'} - ${dayPlan.dayLabel}`,
      subtitle: dayPlan.focus,
      category: (officerProgram?.category as any) || 'Strength',
      frequency: officerProgram?.frequency || '4 Days / Week',
      estimatedDurationMinutes: officerProgram?.estimatedDurationMinutes || 60,
      description: dayPlan.coachNotes || officerProgram?.coachNotes || 'Confidential officer program assigned by coach.',
      exercises: dayPlan.exercises,
    };
    onStartCustomWorkout(workoutProg);
  };

  // Helper to add an exercise to a day
  const handleAddExerciseToDay = (dayIndex: number) => {
    const updated = [...scheduleDays];
    const newEx: ExerciseTemplate = {
      id: `ex-${Date.now()}`,
      name: 'New Prescribed Exercise',
      muscleGroup: 'Full Body',
      defaultSets: 3,
      targetReps: '8-10 reps',
      targetRpe: 8,
      restPeriodSeconds: 90,
      notes: 'Prescribed duty coaching point',
    };
    updated[dayIndex].exercises.push(newEx);
    setScheduleDays(updated);
  };

  // Helper to remove an exercise
  const handleRemoveExerciseFromDay = (dayIndex: number, exIndex: number) => {
    const updated = [...scheduleDays];
    updated[dayIndex].exercises.splice(exIndex, 1);
    setScheduleDays(updated);
  };

  // Helper to add a schedule day
  const handleAddDay = () => {
    const nextDayNum = scheduleDays.length + 1;
    setScheduleDays([
      ...scheduleDays,
      {
        day: nextDayNum,
        dayLabel: `Day ${nextDayNum}: Custom Split`,
        focus: 'Duty Conditioning & Core',
        warmup: '5 mins mobility and core activation',
        exercises: [],
        coachNotes: 'Prescribed for recovery or shift duty.',
      },
    ]);
  };

  // Helper to remove a schedule day
  const handleRemoveDay = (dayIndex: number) => {
    if (scheduleDays.length <= 1) return;
    const updated = scheduleDays.filter((_, i) => i !== dayIndex).map((d, i) => ({
      ...d,
      day: i + 1,
    }));
    setScheduleDays(updated);
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div 
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm animate-fade-in ${
            feedbackMsg.type === 'success' 
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200' 
              : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedbackMsg.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1626] via-[#09111e] to-[#060a12] border border-blue-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/40">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                Confidential Officer Portal
              </span>
              <span className="text-xs font-mono text-slate-400">
                Encrypted Account Isolation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-athletic font-black uppercase tracking-wider text-white">
              Individualized Officer Training Portal
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every officer account has an isolated, private training portal. Upload a 
              customized duty protocol tailored specifically to their shift schedule, body armor load, and physical goals — <strong className="text-blue-300 font-semibold">visible only to them and no one else</strong>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isCoachOrAdmin && (
              <button
                onClick={() => handleOpenUploadModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-900/40 border border-blue-400/30 cursor-pointer transition-all active:scale-95"
              >
                <Upload className="w-4 h-4 text-blue-200" />
                <span>Upload Officer Program</span>
              </button>
            )}
            <div className="px-3 py-2 bg-[#0d1624] border border-slate-700/80 rounded-xl text-xs text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Officer: <strong className="text-white">{currentAthlete.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: COACH / ADMIN MANAGEMENT VIEW (If Coach AJ or Admin) */}
      {isCoachOrAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-athletic font-black uppercase tracking-wider text-white">
                Coach Management: Agency Roster &amp; Assigned Programs
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Admin Access: {allOfficers.length} Officers Registered
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Officers List */}
            <div className="lg:col-span-1 bg-[#0b1320] border border-blue-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Officer Account
                </span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">
                  {allOfficers.length} Accounts
                </span>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {allOfficers.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center italic">
                    No registered officer profiles found in Firestore yet.
                  </p>
                ) : (
                  allOfficers.map((officer) => {
                    const isSelected = selectedTargetOfficer?.id === officer.id;
                    const assignedProg = allAssignedPrograms.find((p) => p.officerUserId === officer.id);

                    return (
                      <div
                        key={officer.id}
                        onClick={() => setSelectedTargetOfficer(officer)}
                        className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-900/30 border-blue-400/80 shadow-md ring-1 ring-blue-500/50'
                            : 'bg-[#0f172a]/60 border-slate-800 hover:border-slate-700 hover:bg-[#0f172a]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-xs font-black text-white">
                              {officer.name[0] || 'O'}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{officer.name}</span>
                                {officer.id === user?.uid && (
                                  <span className="text-[9px] px-1 bg-blue-600/50 text-blue-200 rounded">You</span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                                {officer.email || 'Officer Account'}
                              </div>
                            </div>
                          </div>
                          {assignedProg ? (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                              Assigned
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              No Program
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Officer Detail & Action Card */}
            <div className="lg:col-span-2 bg-[#0b1320] border border-blue-500/20 rounded-xl p-5 space-y-4">
              {selectedTargetOfficer ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-400" />
                        <h3 className="text-base font-bold text-white">
                          Selected: {selectedTargetOfficer.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        UID: {selectedTargetOfficer.id} • Goal: {selectedTargetOfficer.primaryGoal} • Level: {selectedTargetOfficer.experienceLevel}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const existing = allAssignedPrograms.find((p) => p.officerUserId === selectedTargetOfficer.id);
                        handleOpenUploadModal(selectedTargetOfficer, existing);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow transition-all active:scale-95 shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-200" />
                      <span>{allAssignedPrograms.some((p) => p.officerUserId === selectedTargetOfficer.id) ? 'Edit Assigned Program' : 'Upload Program for This Officer'}</span>
                    </button>
                  </div>

                  {/* Program Status for this officer */}
                  {(() => {
                    const assigned = allAssignedPrograms.find((p) => p.officerUserId === selectedTargetOfficer.id);
                    if (!assigned) {
                      return (
                        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-3">
                          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-300">
                            No Individual Program Uploaded Yet
                          </h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Officer {selectedTargetOfficer.name} does not have an individualized program. Click "Upload Program for This Officer" above to create and upload their private protocol.
                          </p>
                          <button
                            onClick={() => handleOpenUploadModal(selectedTargetOfficer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Program</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-[#09111d] border border-blue-500/30 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded font-black uppercase">
                                  {assigned.category}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {assigned.frequency}
                                </span>
                              </div>
                              <h4 className="text-base font-athletic font-black uppercase text-white mt-1">
                                {assigned.programTitle}
                              </h4>
                              {assigned.programSubtitle && (
                                <p className="text-xs text-blue-300/80 mt-0.5">
                                  {assigned.programSubtitle}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenUploadModal(selectedTargetOfficer, assigned)}
                                className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-blue-900/40 rounded transition-colors"
                                title="Edit program"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProgram(assigned.id, selectedTargetOfficer.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                                title="Delete program"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {assigned.coachNotes && (
                            <div className="p-2.5 rounded-lg bg-[#070c14] border border-slate-800 text-xs text-slate-300">
                              <strong className="text-blue-400 block mb-0.5">Coach Prescription Notes:</strong>
                              {assigned.coachNotes}
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Schedule Days</span>
                              <span className="font-bold text-white">{assigned.scheduleDays?.length || 0} Days</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Total Exercises</span>
                              <span className="font-bold text-white">{assigned.exercises?.length || 0} Exercises</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Est. Duration</span>
                              <span className="font-bold text-white">{assigned.estimatedDurationMinutes || 60} Min</span>
                            </div>
                            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                              <span className="text-[10px] text-slate-500 block">Uploaded By</span>
                              <span className="font-bold text-blue-300 truncate block">{assigned.assignedByEmail?.split('@')[0] || 'Coach'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Select an officer from the list on the left to view or upload their individualized program.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: THE LOGGED-IN OFFICER'S PRIVATE PORTAL VIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-athletic font-black uppercase tracking-wider text-white">
              My Individual Duty Protocol
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Private To: {currentAthlete.name}
          </span>
        </div>

        {loadingOfficerProg ? (
          <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-2xl bg-[#0b1320] flex items-center justify-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-sm font-medium">Checking encrypted officer portal...</span>
          </div>
        ) : !officerProgram ? (
          /* Empty State for an officer without an assigned protocol */
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-gradient-to-b from-[#0b1320] to-[#070b12] border border-blue-500/20 shadow-xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-athletic font-black uppercase text-white tracking-wide">
                No Individual Program Assigned Yet
              </h3>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Your account is ready for an individualized prescription. Once Coach Aryan "AJ" Risner creates your custom duty split, it will appear here instantly and exclusively on your account.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center items-center gap-3 text-xs">
              <div className="px-3 py-1.5 bg-[#0e1726] border border-slate-800 rounded-lg text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Account Verified: {user?.email}</span>
              </div>
              <a
                href="mailto:risnerathletics@gmail.com?subject=Custom%20Officer%20Protocol%20Request"
                className="px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Request Custom Program From Coach</span>
              </a>
            </div>
          </div>
        ) : (
          /* Officer's Assigned Protocol is Present! */
          <div className="space-y-5">
            {/* Program Overview Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c182c] via-[#091220] to-[#060b14] border border-blue-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">
                      {officerProgram.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {officerProgram.frequency}
                    </span>
                    {officerProgram.badgeNumber && (
                      <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                        Badge #{officerProgram.badgeNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-athletic font-black uppercase tracking-wide text-white">
                    {officerProgram.programTitle}
                  </h3>
                  {officerProgram.programSubtitle && (
                    <p className="text-sm text-blue-300/90 leading-relaxed font-medium">
                      {officerProgram.programSubtitle}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 block font-mono">Prescribed By</span>
                  <span className="text-xs font-bold text-blue-400">
                    {officerProgram.assignedByEmail || 'Aryan "AJ" Risner (Coach)'}
                  </span>
                </div>
              </div>

              {/* Coach Notes */}
              {officerProgram.coachNotes && (
                <div className="p-3.5 rounded-xl bg-[#080e18] border border-blue-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Confidential Coaching &amp; Duty Directives</span>
                  </div>
                  <p className="whitespace-pre-line">{officerProgram.coachNotes}</p>
                </div>
              )}
            </div>

            {/* Schedule Day Selector Tabs */}
            {officerProgram.scheduleDays && officerProgram.scheduleDays.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {officerProgram.scheduleDays.map((dayPlan, idx) => (
                    <button
                      key={dayPlan.day}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                        activeDayIndex === idx
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400'
                          : 'bg-[#0f172a] text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-[#131f38]'
                      }`}
                    >
                      <span>{dayPlan.dayLabel || `Day ${dayPlan.day}`}</span>
                    </button>
                  ))}
                </div>

                {/* Active Day View */}
                {(() => {
                  const currentDay = officerProgram.scheduleDays[activeDayIndex] || officerProgram.scheduleDays[0];
                  if (!currentDay) return null;

                  return (
                    <div className="rounded-2xl bg-[#0b1320] border border-blue-500/30 p-5 sm:p-6 space-y-5 shadow-xl">
                      {/* Day Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-blue-400">
                              {currentDay.dayLabel || `Day ${currentDay.day}`}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-slate-400 font-mono">
                              {currentDay.exercises.length} Prescribed Movements
                            </span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-athletic font-black uppercase text-white mt-0.5">
                            {currentDay.focus}
                          </h4>
                        </div>

                        {onStartCustomWorkout && currentDay.exercises.length > 0 && (
                          <button
                            onClick={() => handleStartAssignedWorkout(currentDay)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-900/40 border border-blue-400/40 cursor-pointer transition-all active:scale-95 shrink-0"
                          >
                            <Dumbbell className="w-4 h-4" />
                            <span>Launch Live Tracker</span>
                          </button>
                        )}
                      </div>

                      {/* Warmup guidance */}
                      {currentDay.warmup && (
                        <div className="p-3 rounded-xl bg-[#09111e] border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                          <span className="text-amber-400 font-black shrink-0 uppercase tracking-wider text-[10px] mt-0.5 px-1.5 py-0.5 bg-amber-950/70 rounded border border-amber-500/40">
                            Warm-Up
                          </span>
                          <span className="leading-relaxed">{currentDay.warmup}</span>
                        </div>
                      )}

                      {/* Prescribed Exercises Table / Cards */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Prescribed Movement Stack
                        </span>

                        {currentDay.exercises.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                            Rest / Active recovery day. No prescribed lifting movements.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {currentDay.exercises.map((ex, exIdx) => (
                              <div
                                key={ex.id || exIdx}
                                className="p-3.5 rounded-xl bg-[#0e1726] border border-slate-800/80 hover:border-blue-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-400/40 flex items-center justify-center text-[10px] font-bold">
                                      {exIdx + 1}
                                    </span>
                                    <h5 className="text-sm font-bold text-white">
                                      {ex.name}
                                    </h5>
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                      {ex.muscleGroup}
                                    </span>
                                  </div>
                                  {ex.notes && (
                                    <p className="text-xs text-slate-400 pl-7 leading-relaxed">
                                      {ex.notes}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-3 pl-7 sm:pl-0 shrink-0 text-xs font-mono">
                                  <div className="px-2.5 py-1 rounded bg-[#080d16] border border-slate-800 text-center">
                                    <span className="text-[9px] text-slate-500 block">Sets</span>
                                    <span className="font-bold text-white">{ex.defaultSets} Sets</span>
                                  </div>
                                  <div className="px-2.5 py-1 rounded bg-[#080d16] border border-slate-800 text-center">
                                    <span className="text-[9px] text-slate-500 block">Target Reps</span>
                                    <span className="font-bold text-blue-300">{ex.targetReps}</span>
                                  </div>
                                  {ex.targetRpe && (
                                    <div className="px-2.5 py-1 rounded bg-[#080d16] border border-slate-800 text-center">
                                      <span className="text-[9px] text-slate-500 block">Target RPE</span>
                                      <span className="font-bold text-amber-300">{ex.targetRpe}</span>
                                    </div>
                                  )}
                                  <div className="px-2.5 py-1 rounded bg-[#080d16] border border-slate-800 text-center">
                                    <span className="text-[9px] text-slate-500 block">Rest</span>
                                    <span className="font-bold text-slate-300">{ex.restPeriodSeconds}s</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Run / Conditioning pacing note */}
                      {currentDay.runPacing && (
                        <div className="p-3 rounded-xl bg-[#09111e] border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                          <span className="text-blue-400 font-black shrink-0 uppercase tracking-wider text-[10px] mt-0.5 px-1.5 py-0.5 bg-blue-950/70 rounded border border-blue-500/40">
                            Conditioning
                          </span>
                          <span className="leading-relaxed">{currentDay.runPacing}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: UPLOAD / EDIT MODAL FOR COACH AJ / ADMIN */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0b1320] border border-blue-500/40 rounded-2xl shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-[#0b1320]/95 backdrop-blur-md p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-athletic font-black uppercase text-white tracking-wide">
                  {editingProgramId ? 'Edit Assigned Officer Protocol' : 'Upload Program Specific to Officer'}
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProgram} className="p-4 sm:p-6 space-y-5">
              {/* Target Officer Selector */}
              <div className="p-4 rounded-xl bg-[#080d16] border border-blue-500/30 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Target Officer Account (Exclusive Access)</span>
                </label>
                <select
                  value={selectedTargetOfficer?.id || ''}
                  onChange={(e) => {
                    const match = allOfficers.find((o) => o.id === e.target.value);
                    if (match) setSelectedTargetOfficer(match);
                  }}
                  className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  required
                >
                  {allOfficers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email || o.id})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 font-mono">
                  This program will be saved with <code className="text-blue-300">officerUserId = "{selectedTargetOfficer?.id}"</code> so that no other officer can view it.
                </p>
              </div>

              {/* General Program Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    value={progTitle}
                    onChange={(e) => setProgTitle(e.target.value)}
                    placeholder="e.g. Officer Davis 6-Week SWAT Preparation Protocol"
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Subtitle / Operational Focus
                  </label>
                  <input
                    type="text"
                    value={progSubtitle}
                    onChange={(e) => setProgSubtitle(e.target.value)}
                    placeholder="e.g. Body Armor Joint Stability & Pursuit Acceleration"
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Category
                  </label>
                  <select
                    value={progCategory}
                    onChange={(e) => setProgCategory(e.target.value as any)}
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  >
                    <option value="Tactical & Rucking">Tactical &amp; Rucking</option>
                    <option value="Strength">Strength &amp; Armor</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Athletic Conditioning">Athletic Conditioning</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Frequency / Split
                  </label>
                  <input
                    type="text"
                    value={progFrequency}
                    onChange={(e) => setProgFrequency(e.target.value)}
                    placeholder="e.g. 4 Days / Week (Shift Rotation)"
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Badge Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={badgeNumberInput}
                    onChange={(e) => setBadgeNumberInput(e.target.value)}
                    placeholder="e.g. 4182"
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Department / Agency
                  </label>
                  <input
                    type="text"
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                    placeholder="e.g. Metropolitan Patrol Division"
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Confidential Coach Prescription &amp; Shift Notes
                  </label>
                  <textarea
                    rows={3}
                    value={progNotes}
                    onChange={(e) => setProgNotes(e.target.value)}
                    placeholder="Detailed confidential notes on rest intervals, injury accommodations, plate carrier wear, or duty shifts..."
                    className="w-full bg-[#0d1626] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Schedule Days Builder */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-athletic font-black uppercase text-white tracking-wide">
                      Training Schedule Days ({scheduleDays.length} Days)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Build the day-by-day workout splits and exercises for this officer.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>

                {scheduleDays.map((dayPlan, dayIdx) => (
                  <div
                    key={dayPlan.day}
                    className="p-4 rounded-xl bg-[#09111e] border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded bg-blue-600/40 text-blue-300 text-xs font-bold flex items-center justify-center">
                          {dayPlan.day}
                        </span>
                        <input
                          type="text"
                          value={dayPlan.dayLabel}
                          onChange={(e) => {
                            const updated = [...scheduleDays];
                            updated[dayIdx].dayLabel = e.target.value;
                            setScheduleDays(updated);
                          }}
                          placeholder="Day Label (e.g. Day 1: Duty Strength)"
                          className="bg-[#0d1626] border border-slate-700 rounded px-2.5 py-1 text-xs text-white font-bold flex-1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDay(dayIdx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded"
                        title="Remove Day"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Focus
                        </label>
                        <input
                          type="text"
                          value={dayPlan.focus}
                          onChange={(e) => {
                            const updated = [...scheduleDays];
                            updated[dayIdx].focus = e.target.value;
                            setScheduleDays(updated);
                          }}
                          placeholder="e.g. Lower Body & Combat Chassis"
                          className="w-full bg-[#0d1626] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                          Warm-Up Notes
                        </label>
                        <input
                          type="text"
                          value={dayPlan.warmup}
                          onChange={(e) => {
                            const updated = [...scheduleDays];
                            updated[dayIdx].warmup = e.target.value;
                            setScheduleDays(updated);
                          }}
                          placeholder="Dynamic mobility, band work..."
                          className="w-full bg-[#0d1626] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>

                    {/* Exercises in this day */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">
                          Exercises ({dayPlan.exercises.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddExerciseToDay(dayIdx)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Exercise</span>
                        </button>
                      </div>

                      {dayPlan.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id || exIdx}
                          className="p-2.5 rounded-lg bg-[#0e1726] border border-slate-800/80 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => {
                                const updated = [...scheduleDays];
                                updated[dayIdx].exercises[exIdx].name = e.target.value;
                                setScheduleDays(updated);
                              }}
                              placeholder="Exercise Name"
                              className="bg-[#0b1320] border border-slate-700 rounded px-2 py-1 text-xs text-white font-bold flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseFromDay(dayIdx, exIdx)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 block">Sets</span>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={ex.defaultSets}
                                onChange={(e) => {
                                  const updated = [...scheduleDays];
                                  updated[dayIdx].exercises[exIdx].defaultSets = Number(e.target.value) || 3;
                                  setScheduleDays(updated);
                                }}
                                className="w-full bg-[#0b1320] border border-slate-700 rounded px-1.5 py-0.5 text-white"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 block">Target Reps</span>
                              <input
                                type="text"
                                value={ex.targetReps}
                                onChange={(e) => {
                                  const updated = [...scheduleDays];
                                  updated[dayIdx].exercises[exIdx].targetReps = e.target.value;
                                  setScheduleDays(updated);
                                }}
                                placeholder="8-10 reps"
                                className="w-full bg-[#0b1320] border border-slate-700 rounded px-1.5 py-0.5 text-white"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 block">Rest (sec)</span>
                              <input
                                type="number"
                                value={ex.restPeriodSeconds}
                                onChange={(e) => {
                                  const updated = [...scheduleDays];
                                  updated[dayIdx].exercises[exIdx].restPeriodSeconds = Number(e.target.value) || 90;
                                  setScheduleDays(updated);
                                }}
                                className="w-full bg-[#0b1320] border border-slate-700 rounded px-1.5 py-0.5 text-white"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 block">Muscle Group</span>
                              <select
                                value={ex.muscleGroup}
                                onChange={(e) => {
                                  const updated = [...scheduleDays];
                                  updated[dayIdx].exercises[exIdx].muscleGroup = e.target.value as any;
                                  setScheduleDays(updated);
                                }}
                                className="w-full bg-[#0b1320] border border-slate-700 rounded px-1.5 py-0.5 text-white"
                              >
                                <option value="Chest">Chest</option>
                                <option value="Back">Back</option>
                                <option value="Quads">Quads</option>
                                <option value="Hamstrings & Glutes">Hamstrings &amp; Glutes</option>
                                <option value="Shoulders">Shoulders</option>
                                <option value="Arms">Arms</option>
                                <option value="Core">Core</option>
                                <option value="Full Body">Full Body</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="sticky bottom-0 bg-[#0b1320]/95 backdrop-blur-md pt-4 pb-2 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg shadow-blue-900/50 border border-blue-400/40 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Saving to Officer Account...' : 'Confirm & Upload Program'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
