import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { z } from 'zod';
import { generateStructure } from './ai.js';
import { normalizeStructure } from './validate.js';
import { structureToSchem } from './schem.js';

if (!process.env.GEMINI_API_KEY && !process.env.DEEPSEEK_API_KEY) {
  console.error('Ne GEMINI_API_KEY ne de DEEPSEEK_API_KEY tanimli degil (.env dosyasini kontrol edin).');
  process.exit(1);
}

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '30mb' }));

// Maliyeti ve kotayi korumak icin IP basina dakikada 10 uretim.
const generateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Cok fazla istek. Lutfen bir dakika sonra tekrar deneyin.' },
});

const PromptBody = z.object({
  prompt: z.string().trim().min(3).max(4000),
  provider: z.enum(['auto', 'deepseek', 'gemini']).optional().default('auto'),
});

// POST /api/generate  { prompt, provider? }  ->  yapi JSON'u
app.post('/api/generate', generateLimiter, async (req, res) => {
  const parsed = PromptBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Prompt 3-4000 karakter olmali.' });
  }
  try {
    const structure = await generateStructure(parsed.data.prompt, parsed.data.provider);
    res.json(structure);
  } catch (err) {
    console.error('[generate]', err);
    res.status(502).json({ error: err.message || 'Yapi uretilemedi. Lutfen istegi degistirip tekrar deneyin.' });
  }
});

// POST /api/schem  { ...yapi JSON }  ->  .schem dosyasi (binary)
app.post('/api/schem', (req, res) => {
  try {
    const structure = normalizeStructure(req.body);
    const buffer = structureToSchem(structure);
    const safeName =
      structure.structure_name.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 60) || 'structure';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.schem"`);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(buffer);
  } catch (err) {
    res.status(400).json({ error: `Gecersiz yapi: ${err.message}` });
  }
});

app.get('/api/health', (_req, res) => res.json({
  ok: true,
  hasGemini: Boolean(process.env.GEMINI_API_KEY),
  hasDeepSeek: Boolean(process.env.DEEPSEEK_API_KEY),
  defaultProvider: process.env.AI_PROVIDER || 'auto'
}));

// Serves the client SPA in production or Docker when client/dist exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const port = Number(process.env.PORT || 8787);
app.listen(port, () => console.log(`BlockArchitect API http://localhost:${port}`));
