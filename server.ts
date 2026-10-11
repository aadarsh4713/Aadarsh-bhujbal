import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are Apex Coach, a world-class Olympic strength & conditioning coach, biomechanics specialist, and exercise physiologist built directly into ApexFit.

When advising lifters, be direct, scientifically rigorous, concise, and focused on high-efficiency results. Structure your responses with crisp headers and bullet points so lifters can quickly read them between sets:

1. 🎯 BIOMECHANICAL DIAGNOSTIC & FORM FIX
- Identify the exact mechanical failure point (e.g. why they are stuck on lat pulldown, bench press, squat, or rows).
- Provide 3-4 specific setup and execution cues (e.g. for Lat Pulldown: 'Depress and lock scapulae BEFORE initiating elbow pull', 'Drive elbows into back pockets rather than yanking with forearms', 'Maintain a stable 10-15° torso lean without swinging', 'Slow the eccentric phase to 3 seconds for maximum mechanical tension').

2. 📊 SESSION REVIEW & METABOLIC IMPACT
- When evaluating session logs, outline:
  • Key Benefits Achieved: Muscle groups targeted, motor unit recruitment, neural adaptation, volume threshold.
  • Potential Drawbacks / Fatigue Traps: Junk volume, excessive joint strain, RPE overshoot, or delayed recovery.

3. 📈 PROGRESSIVE OVERLOAD & PLATEAU PROTOCOL
- Provide a clear, actionable prescription to break plateaus:
  • Micro-loading strategy (e.g. +1.25kg / +2.5lbs increments).
  • Rep bracket progression (e.g. progress 3x8 -> 3x10 before advancing pin weight).
  • Primer & Accessory exercises (e.g. Lat Pullover machine, Scapular Pull-ups, Face Pulls).

4. TONE & FORMAT
- Confident, empowering, authoritative, and zero fluff.
- Use bold markers, bullet points, and practical gym cues.`;

// Multi-turn Gemini chat endpoint
app.post('/api/coach/chat', async (req, res) => {
  try {
    const { messages, workoutContext, model } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Supported models per instructions
    const allowedModels = [
      'gemini-3.5-flash',
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview',
    ];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-3.8-flash';

    // Format contents for @google/genai
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Inject contextual workout data into system instruction if present
    let dynamicSystemPrompt = SYSTEM_INSTRUCTION;
    if (workoutContext) {
      dynamicSystemPrompt += `\n\n[CURRENT ATHLETE WORKOUT CONTEXT]:\n${JSON.stringify(workoutContext, null, 2)}`;
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: dynamicSystemPrompt,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text || 'Keep pushing your limits. I am ready for your next question.',
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Gemini Coach API error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate coach response.',
    });
  }
});

// Plate Calculator API helper
app.post('/api/tools/plates', (req, res) => {
  const { targetWeight, barWeight = 20, unit = 'kg' } = req.body;
  if (!targetWeight || targetWeight < barWeight) {
    return res.json({ platesPerSide: [], remainder: 0 });
  }

  const weightPerSide = (targetWeight - barWeight) / 2;
  const availablePlates = unit === 'kg' ? [25, 20, 15, 10, 5, 2.5, 1.25] : [45, 35, 25, 10, 5, 2.5];

  let remaining = weightPerSide;
  const result: { plate: number; count: number }[] = [];

  for (const plate of availablePlates) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      result.push({ plate, count });
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  }

  res.json({
    platesPerSide: result,
    weightPerSide,
    remainder: remaining,
  });
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`ApexFit server listening on port ${port}`);
});
