import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, Modality, LiveServerMessage } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface WorkoutGenerationRequest {
  goals: string[];
  fitnessLevel: string;
  frequency: string;
  scheduleDuration: 'weekly' | 'monthly';
  equipment: string[];
  sessionDurationMinutes?: number;
  injuries?: string[];
  injuryNotes?: string;
  notes?: string;
  userEmail?: string;
}

// Fallback high-quality template generator in case API key is missing or quota exceeded
function generateFallbackWorkoutPlan(params: WorkoutGenerationRequest) {
  const goalStr = params.goals?.join(', ') || 'General Conditioning';
  const isHypertrophy = params.goals?.some(g => g.toLowerCase().includes('hypertrophy') || g.toLowerCase().includes('muscle'));
  const isStrength = params.goals?.some(g => g.toLowerCase().includes('strength') || g.toLowerCase().includes('power'));
  const isEndurance = params.goals?.some(g => g.toLowerCase().includes('endurance') || g.toLowerCase().includes('loss'));

  const injuryRaw = [
    ...(params.injuries || []),
    params.injuryNotes || '',
    params.notes || '',
  ].join(' ');
  const injuryLower = injuryRaw.toLowerCase();
  const hasHipInjury = /hip|labrum|fai|impingement|groin|acetabul/i.test(injuryLower);
  const hasBackInjury = /back|lumbar|disc|herniat|sciatica|spine/i.test(injuryLower);
  const hasShoulderInjury = /shoulder|rotator|cuff|ac joint/i.test(injuryLower);

  const category = isStrength ? 'Strength' : isHypertrophy ? 'Hypertrophy' : isEndurance ? 'Athletic Conditioning' : 'Hybrid';
  const durationDays = params.scheduleDuration === 'monthly' ? 28 : 7;
  const daysPerWeek = parseInt(params.frequency, 10) || 4;

  const sampleDays = [
    {
      day: 1,
      focus: 'Day 1: Heavy Armor Upper Body & Horizontal Press/Pull',
      isRestDay: false,
      exercises: [
        {
          id: 'ex-ai-1',
          name: 'Barbell Bench Press (or Heavy DB Floor Press)',
          muscleGroup: 'Chest' as const,
          defaultSets: 4,
          targetReps: isStrength ? '5 reps' : '8-10 reps',
          restPeriodSeconds: 120,
          targetRpe: 8,
          notes: 'Lower with controlled 3-second eccentric. Explode through lockout.',
        },
        {
          id: 'ex-ai-2',
          name: 'Chest-Supported Row or Barbell Pendlay Row',
          muscleGroup: 'Back' as const,
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Full scapular retraction at top. Squeeze lats for 1 second.',
        },
        {
          id: 'ex-ai-3',
          name: 'Standing Overhead Barbell/Dumbbell Military Press',
          muscleGroup: 'Shoulders' as const,
          defaultSets: 3,
          targetReps: '8-12 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Glutes and core locked down. Press in a straight vertical bar path.',
        },
        {
          id: 'ex-ai-4',
          name: 'Weighted or Assisted Pull-Ups',
          muscleGroup: 'Back' as const,
          defaultSets: 3,
          targetReps: '6-8 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Full dead-hang at bottom, chest up to touch the bar.',
        },
        {
          id: 'ex-ai-5',
          name: 'Hanging Knee Raises / Hollow Body Rocks',
          muscleGroup: 'Core' as const,
          defaultSets: 3,
          targetReps: '15-20 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Strict core tension. Avoid swinging or momentum.',
        },
      ],
    },
    {
      day: 2,
      focus: hasHipInjury
        ? 'Day 2: Lower Body Power & Hip-Sparing Kinetic Chain (Labrum Protected)'
        : 'Day 2: Lower Body Kinetic Power & Posterior Chain',
      isRestDay: false,
      exercises: hasHipInjury ? [
        {
          id: 'ex-ai-6',
          name: 'Box Squat to Parallel (Hip Labrum & Joint Protection)',
          muscleGroup: 'Quads' as const,
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'CLINICAL LABRUM PROTOCOL: Box height set to 90° or slightly above. Keep shins vertical and sit back into hips. Eliminates femoral head impingement against acetabular labrum. Never dive below parallel.',
        },
        {
          id: 'ex-ai-7',
          name: 'High-Handle Trap Bar RDL (Restricted Hip Hinge Depth)',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 4,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 7,
          notes: 'Hinge back with soft knees only to mid-shin level. Stop before any pinch or tension at anterior hip socket.',
        },
        {
          id: 'ex-ai-8',
          name: 'Banded Spanish Squats or Terminal Knee Extensions (TKE)',
          muscleGroup: 'Quads' as const,
          defaultSets: 3,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Heavy band behind knees forces vertical tibia. Delivers intense quad hypertrophy with zero hip joint irritation.',
        },
        {
          id: 'ex-ai-8b',
          name: 'Barbell or Dumbbell Hip Thrusts (Neutral Pelvis)',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 3,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Drive through heels. Squeeze glutes at top lockout with neutral pelvis. Does not enter deep hip flexion, keeping labrum safe.',
        },
      ] : [
        {
          id: 'ex-ai-6',
          name: 'Barbell Back Squat or Trap Bar Deadlift',
          muscleGroup: 'Quads' as const,
          defaultSets: 4,
          targetReps: isStrength ? '5 reps' : '6-8 reps',
          restPeriodSeconds: 150,
          targetRpe: 8,
          notes: 'Brace abdominal wall tightly against duty belt line. Drive knees out.',
        },
        {
          id: 'ex-ai-7',
          name: 'Romanian Deadlift (RDL)',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 3,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Hips back until hamstring stretch is felt. Maintain neutral lumbar spine.',
        },
        {
          id: 'ex-ai-8',
          name: 'Bulgarian Split Squats (or Walking DB Lunges)',
          muscleGroup: 'Quads' as const,
          defaultSets: 3,
          targetReps: '10-12 reps/leg',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Unilateral stability for duty sprint velocity and knee health.',
        },
        {
          id: 'ex-ai-9',
          name: 'Standing Heavy Calf Raises',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 3,
          targetReps: '15 reps',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: '2-second stretch at bottom, explosive drive onto big toes.',
        },
        {
          id: 'ex-ai-10',
          name: 'Standing Suitcase Carries',
          muscleGroup: 'Core' as const,
          defaultSets: 3,
          targetReps: '50 yds/side',
          restPeriodSeconds: 60,
          targetRpe: 7,
          notes: 'Antilateral flexion. Walk upright with zero torso tilting.',
        },
      ],
    },
    {
      day: 3,
      focus: 'Day 3: Active Tactical Recovery & Mobility Flush',
      isRestDay: true,
      exercises: [],
    },
    {
      day: 4,
      focus: 'Day 4: Tactical Upper Hypertrophy & Arm Armor',
      isRestDay: false,
      exercises: [
        {
          id: 'ex-ai-11',
          name: 'Incline Dumbbell Bench Press',
          muscleGroup: 'Chest' as const,
          defaultSets: 4,
          targetReps: '10-12 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'Upper clavicular head focus. Controlled eccentric.',
        },
        {
          id: 'ex-ai-12',
          name: 'Neutral Grip Lat Pulldown or Single-Arm Cable Row',
          muscleGroup: 'Back' as const,
          defaultSets: 4,
          targetReps: '10-12 reps',
          restPeriodSeconds: 75,
          targetRpe: 8,
          notes: 'Pull elbows toward back pockets to hit lower lats.',
        },
        {
          id: 'ex-ai-13',
          name: 'Dumbbell Lateral Raises (Heavy Leaning or Cable)',
          muscleGroup: 'Shoulders' as const,
          defaultSets: 4,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Slight forward lean, lead with elbows for medial delt cap.',
        },
        {
          id: 'ex-ai-14',
          name: 'Overhead Cable Triceps Extensions & Barbell Biceps Curls',
          muscleGroup: 'Arms' as const,
          defaultSets: 3,
          targetReps: '12-15 reps',
          restPeriodSeconds: 60,
          targetRpe: 8,
          notes: 'Superset arms for combat grip strength and elbow tendon resilience.',
        },
      ],
    },
    {
      day: 5,
      focus: 'Day 5: Posterior Chain Overload & Tactical Conditioning',
      isRestDay: false,
      exercises: [
        {
          id: 'ex-ai-15',
          name: 'Conventional Deadlift or Heavy Kettlebell Swings',
          muscleGroup: 'Hamstrings & Glutes' as const,
          defaultSets: 4,
          targetReps: isStrength ? '4-6 reps' : '8-10 reps',
          restPeriodSeconds: 150,
          targetRpe: 8,
          notes: 'Maximum whole-body recruitment. Solid hip hinge lockout.',
        },
        {
          id: 'ex-ai-16',
          name: 'Front Squats or Goblet Squats',
          muscleGroup: 'Quads' as const,
          defaultSets: 3,
          targetReps: '8-10 reps',
          restPeriodSeconds: 90,
          targetRpe: 8,
          notes: 'High torso angle builds anterior core and quadriceps depth.',
        },
        {
          id: 'ex-ai-17',
          name: 'Farmers Walk with Heavy Dumbbells or Trap Bar',
          muscleGroup: 'Full Body' as const,
          defaultSets: 4,
          targetReps: '60 yds',
          restPeriodSeconds: 90,
          targetRpe: 9,
          notes: 'Crush grip, chest proud, short rapid steps.',
        },
      ],
    },
    {
      day: 6,
      focus: 'Day 6: Aerobic Base Flush or Tactical Ruck Interval',
      isRestDay: daysPerWeek < 5,
      exercises: daysPerWeek < 5 ? [] : [
        {
          id: 'ex-ai-18',
          name: 'Zone 2 Ruck or Trail Run (35-45 lbs)',
          muscleGroup: 'Full Body' as const,
          defaultSets: 1,
          targetReps: '3.0 - 4.0 miles',
          restPeriodSeconds: 0,
          targetRpe: 6,
          notes: 'Conversational pace (120-140 BPM). Aerobic cardiac stroke volume development.',
        },
      ],
    },
    {
      day: 7,
      focus: 'Day 7: Full Regeneration & Ready State Mobility',
      isRestDay: true,
      exercises: [],
    },
  ];

  // If monthly duration requested, repeat the weekly block structure across 4 weeks with progression notes
  const fullSchedule = [];
  if (params.scheduleDuration === 'monthly') {
    for (let w = 0; w < 4; w++) {
      for (const d of sampleDays) {
        const dayNumber = w * 7 + d.day;
        const weekLabel = `Week ${w + 1}`;
        fullSchedule.push({
          day: dayNumber,
          focus: `${weekLabel} - ${d.focus}`,
          isRestDay: d.isRestDay,
          exercises: d.exercises.map(ex => ({
            ...ex,
            id: `${ex.id}-w${w + 1}`,
            notes: w === 3 ? `${ex.notes} [Deload/Peak week: reduce volume by 25% to consolidate gains]` : ex.notes,
          })),
        });
      }
    }
  } else {
    fullSchedule.push(...sampleDays);
  }

  return {
    title: `AI Personalized ${category} Protocol`,
    subtitle: `Custom tailored for ${params.fitnessLevel} • ${params.frequency} • ${goalStr}`,
    category,
    frequency: params.frequency,
    scheduleDuration: params.scheduleDuration === 'monthly' ? '4-Week Monthly Protocol' : '7-Day Rotation',
    estimatedDurationMinutes: params.sessionDurationMinutes || 55,
    description: `Scientifically calibrated ${category.toLowerCase()} protocol designed specifically around ${goalStr.toLowerCase()}. Built with progressive overload mechanisms, optimal recovery pacing for ${params.fitnessLevel.toLowerCase()} athletes, and formatted to run with equipment: ${params.equipment?.join(', ') || 'Standard gym equipment'}.`,
    coachingPhilosophy: `Patrol Ready Performance periodization: Compound multi-joint lifts come first when neural drive is highest, followed by targeted structural hypertrophy and stabilization. Rest intervals are strictly timed to balance ATP-CP restoration with metabolic stress.`,
    weeklyProgressionTips: [
      'Apply double progression: when you achieve the upper target rep count across all working sets, increase load by 2.5-5 lbs on upper body and 5-10 lbs on lower body.',
      'Maintain RPE discipline: leave 1-2 reps in reserve on compound lifts to prevent systemic central nervous system burnout.',
      'Sleep minimum 7.5 hours per night for hormone optimization and muscle tissue repair.',
    ],
    nutritionAdvice: isHypertrophy
      ? 'Consume 0.8-1.0g protein per lb of bodyweight daily with a slight 250-350 kcal surplus.'
      : 'Maintain high protein intake (1.0g/lb) with whole-food nutrient density and adequate hydration with electrolytes.',
    schedule: fullSchedule,
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Shared Gemini client management with reactive API key lookup
  let cachedAi: GoogleGenAI | null = null;
  let lastApiKey = '';

  function getGeminiClient(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.trim().length === 0) {
      cachedAi = null;
      lastApiKey = '';
      return null;
    }
    if (cachedAi && lastApiKey === key) {
      return cachedAi;
    }
    try {
      cachedAi = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      lastApiKey = key;
      return cachedAi;
    } catch (err) {
      console.warn('[Server] Error initializing GoogleGenAI:', err);
      return null;
    }
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // POST /api/gemini/generate-workout-plan
  app.post('/api/gemini/generate-workout-plan', async (req, res) => {
    const params: WorkoutGenerationRequest = req.body;

    if (!params || !params.goals || !params.fitnessLevel) {
      return res.status(400).json({
        error: 'Missing required training parameters (goals, fitnessLevel, frequency, equipment).',
      });
    }

    const ai = getGeminiClient();

    // If Gemini client is not initialized or API key is absent, return the calibrated fallback plan
    if (!ai) {
      console.log('[Server] No GEMINI_API_KEY configured. Serving high-fidelity personalized fallback plan.');
      const fallback = generateFallbackWorkoutPlan(params);
      return res.json({
        success: true,
        data: fallback,
        source: 'local_engine',
      });
    }

    try {
      const scheduleDaysTarget = params.scheduleDuration === 'monthly' ? 28 : 7;
      const daysPerWeek = parseInt(params.frequency, 10) || 4;

      const injuriesList = [
        ...(params.injuries || []),
        params.injuryNotes || '',
        params.notes || '',
      ].filter((s) => s && s.trim().length > 0);
      const injuryReported = injuriesList.join('; ');

      const injuryDirectives = injuryReported ? `
================================================================================
CRITICAL MEDICAL SAFETY & INJURY ADAPTATION DIRECTIVE (ZERO-TOLERANCE MANDATE):
The athlete has reported the following injury/condition: "${injuryReported}".
YOU ARE STRICTLY FORBIDDEN FROM PRESCRIBING ANY EXERCISES THAT AGGRAVATE THIS CONDITION.
1. HIP LABRUM TEAR / FAI / HIP IMPINGEMENT:
   - STRICTLY FORBIDDEN: Barbell Back Squats (heavy, deep, or standard), Front Squats past 90°, 45-degree leg press, deep walking lunges, Bulgarian split squats with deep hip flexion.
   - MANDATORY SUBSTITUTES: Box Squats to parallel or above 90° (vertical shins), Belt Squats, Spanish Squats, High-Handle Trap Bar RDLs (restricted hinge depth), Glute Bridges/Hip Thrusts with neutral pelvis, Backward Sled Drags/Pushes.
2. LOWER BACK / LUMBAR DISC / SCIATICA:
   - FORBIDDEN: Heavy axial barbell squats, conventional deadlifts from floor, standing good mornings.
   - SUBSTITUTES: Belt squats, Chest-supported rows, High-handle trap bar deadlifts, McGill Big 3.
3. SHOULDER / ROTATOR CUFF:
   - FORBIDDEN: Behind-the-neck presses, military presses with flared elbows, deep dips, wide bench.
   - SUBSTITUTES: Neutral-grip DB floor presses, landmine presses, face pulls.
4. KNEE / PATELLAR / MENISCUS:
   - FORBIDDEN: Explosive jump squats, lunges with forward knee tracking over toes under load.
   - SUBSTITUTES: Backward sled drags, box squats with vertical shins, hamstring curls.
Include clinical modification cues in each exercise's 'notes' field.
================================================================================
` : '';

      const systemPrompt = `You are the Head Tactical Strength & Conditioning Coach at Patrol Ready Performance, specializing in elite physical preparation, law enforcement readiness, hybrid athlete periodization, and science-backed progressive overload.
Create a comprehensive, custom-tailored workout schedule matching the athlete's exact specifications:
- Fitness Goals: ${params.goals.join(', ')}
- Current Fitness Level: ${params.fitnessLevel}
- Workout Frequency: ${params.frequency} (${daysPerWeek} training days per 7 days)
- Schedule Type: ${params.scheduleDuration === 'monthly' ? '4-Week Monthly Periodized Block (Day 1 through Day 28)' : '7-Day Rotation Schedule (Day 1 through Day 7)'}
- Available Equipment: ${params.equipment.join(', ')}
- Target Session Duration: ${params.sessionDurationMinutes || 55} minutes
- Reported Injuries / Medical Limitations: ${injuryReported || 'None reported'}
- Special Notes / Constraints: ${params.notes || 'None'}
${injuryDirectives}

RULES:
1. Every day MUST have a day number (Day 1, Day 2, etc.), a focus description, isRestDay boolean, and an array of exercises (empty if isRestDay).
2. For training days, program 4 to 6 specific exercises strictly matching the available equipment.
3. Every exercise must specify:
   - id: unique string (e.g. "ex-1")
   - name: clear exercise name
   - muscleGroup: one of ['Chest', 'Back', 'Quads', 'Hamstrings & Glutes', 'Shoulders', 'Arms', 'Core', 'Full Body']
   - defaultSets: integer (typically 3 or 4)
   - targetReps: string (e.g. "6-8 reps", "10-12 reps", "5x5", "45s hold")
   - restPeriodSeconds: integer (e.g. 60, 90, 120, 180)
   - targetRpe: integer between 6 and 9
   - notes: tactical execution cue and progressive overload trigger
4. Category MUST be one of: 'Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'.
5. Include actionable weeklyProgressionTips and nutrition advice tailored to their goal.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ['Strength', 'Hypertrophy', 'Athletic Conditioning', 'Power', 'Hybrid'],
              },
              frequency: { type: Type.STRING },
              scheduleDuration: { type: Type.STRING },
              estimatedDurationMinutes: { type: Type.INTEGER },
              description: { type: Type.STRING },
              coachingPhilosophy: { type: Type.STRING },
              weeklyProgressionTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              nutritionAdvice: { type: Type.STRING },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    focus: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          muscleGroup: {
                            type: Type.STRING,
                            enum: ['Chest', 'Back', 'Quads', 'Hamstrings & Glutes', 'Shoulders', 'Arms', 'Core', 'Full Body'],
                          },
                          defaultSets: { type: Type.INTEGER },
                          targetReps: { type: Type.STRING },
                          restPeriodSeconds: { type: Type.INTEGER },
                          targetRpe: { type: Type.INTEGER },
                          notes: { type: Type.STRING },
                        },
                        required: ['id', 'name', 'muscleGroup', 'defaultSets', 'targetReps', 'restPeriodSeconds'],
                      },
                    },
                  },
                  required: ['day', 'focus', 'isRestDay', 'exercises'],
                },
              },
            },
            required: [
              'title',
              'subtitle',
              'category',
              'frequency',
              'scheduleDuration',
              'estimatedDurationMinutes',
              'description',
              'schedule',
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API returned an empty response.');
      }

      const parsedPlan = JSON.parse(responseText);
      return res.json({
        success: true,
        data: parsedPlan,
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('[Server] Gemini generation failed:', err);
      // If error occurs, gracefully fallback so the user always receives a personalized workout plan
      const fallback = generateFallbackWorkoutPlan(params);
      return res.json({
        success: true,
        data: fallback,
        source: 'local_engine_fallback',
        warning: err?.message || 'Gemini service note: delivered calibrated tactical template.',
      });
    }
  });

  // POST /api/gemini/stream (Server-Sent Events streaming)
  app.post('/api/gemini/stream', async (req, res) => {
    const { prompt, systemInstruction } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt parameter.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err: any) {
      console.error('[Server] Gemini streaming failed:', err);
      res.write(`data: ${JSON.stringify({ error: err?.message || 'Streaming failed' })}\n\n`);
      res.end();
    }
  });

  const server = http.createServer(app);

  // WebSocket Server for Gemini Live API real-time bidirectional audio/video
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const host = request.headers.host || 'localhost:3000';
    const pathname = request.url ? new URL(request.url, `http://${host}`).pathname : '';
    if (pathname === '/api/gemini/live' || pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Server] Gemini Live WebSocket client connected');
    const ai = getGeminiClient();
    if (!ai) {
      clientWs.send(JSON.stringify({ error: 'Gemini API not configured on server' }));
      clientWs.close();
      return;
    }

    try {
      const session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are the Head Tactical Strength & Conditioning Coach at Patrol Ready Performance, coaching frontline officers and tactical athletes with clear, encouraging, science-backed guidance.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.close();
            }
          },
        },
      });

      clientWs.on('message', (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (msg.text) {
            session.sendClientContent({
              turns: [{ role: 'user', parts: [{ text: msg.text }] }],
              turnComplete: true,
            });
          }
        } catch (e) {
          console.warn('[Server] Live WS message parsing error:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          session.close();
        } catch {}
      });
    } catch (err: any) {
      console.error('[Server] Gemini Live API connection failed:', err);
      clientWs.send(JSON.stringify({ error: err?.message || 'Failed to initialize Gemini Live session' }));
      clientWs.close();
    }
  });

  // Mount Vite middlewares in development or serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.use((req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Patrol Ready Server] Full-stack application running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
