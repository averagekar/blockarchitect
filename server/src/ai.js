import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { SYSTEM_PROMPT, repairPrompt } from './prompt.js';
import { buildStructure, BuildError } from './builder.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const GEMINI_TEMP = Number(process.env.GEMINI_TEMPERATURE ?? 0.8);
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEFAULT_PROVIDER = process.env.AI_PROVIDER || 'auto';

const MAX_ROUNDS = 3; // 1 üretim + en fazla 2 onarım

// Gemini SDK (anahtar varsa ilklendirilir)
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Modelin döndürdüğü PLAN (koordinat matrisi değil, mimari komutlar).
const PlanSchema = z.object({
  structure_name: z.string().min(1).max(100).default('structure'),
  materials: z.record(z.string(), z.any()).default({}),
  ops: z.array(z.record(z.string(), z.any())).min(1).max(1200),
});

function extractJson(text) {
  let cleaned = (text ?? '').trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

// -------------------------------------------------------------
// DEEPSEEK API ÇAĞRISI (OpenAI Uyumlu Chat Completions)
// -------------------------------------------------------------
async function askDeepSeek(messages) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY sunucu .env dosyasında tanımlı değil.');
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_API_KEY.trim()}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  const resJson = await response.json();

  if (!response.ok) {
    const errMsg = resJson?.error?.message || response.statusText;
    if (errMsg.toLowerCase().includes('insufficient balance')) {
      throw new Error(
        'DeepSeek API Hatası: Yetersiz Bakiye (Insufficient Balance). Lütfen platform.deepseek.com üzerinden API hesabınıza bakiye yükleyin.'
      );
    }
    throw new Error(`DeepSeek API Hatası (${response.status}): ${errMsg}`);
  }

  const content = resJson.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('DeepSeek boş yanıt döndürdü.');
  }

  const data = extractJson(content);
  return PlanSchema.parse(data);
}

// -------------------------------------------------------------
// GEMINI API ÇAĞRISI (GoogleGenAI SDK)
// -------------------------------------------------------------
const GEMINI_FALLBACKS = [
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
].filter((v, i, a) => a.indexOf(v) === i);

async function askGemini(promptText) {
  if (!gemini) {
    throw new Error('GEMINI_API_KEY sunucu .env dosyasında tanımlı değil.');
  }

  let lastErr = null;
  for (const modelName of GEMINI_FALLBACKS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const config = {
          systemInstruction: SYSTEM_PROMPT,
          temperature: GEMINI_TEMP,
          responseMimeType: 'application/json',
          maxOutputTokens: 32768,
        };

        // Karmaşık uzamsal ve geometrik mantık yürütme için Thinking Budget
        if (modelName.includes('3.5') || modelName.includes('3.6') || modelName.includes('3.7') || modelName.includes('3.8')) {
          config.thinkingConfig = { thinkingBudget: 2048 };
        }

        const response = await gemini.models.generateContent({
          model: modelName,
          contents: promptText,
          config,
        });
        const data = extractJson(response.text);
        return PlanSchema.parse(data);
      } catch (err) {
        lastErr = err;
        const msg = String(err.message || '');
        if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[AI] ${modelName} günlük/dakikalık kota aşıldı. Sıradaki modele geçiliyor...`);
          break; // Kota aşıldıysa aynı modelde bekleme, diğer modele geç
        }
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          console.warn(`[AI] ${modelName} geçici yoğunluk (deneme ${attempt + 1}/2).`);
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          break; // 2. denemede de meşgulse hemen diğer modele geç
        }
        // Eğer thinkingConfig desteklenmiyorsa normal dene
        if (msg.includes('thinkingConfig') || msg.includes('budget')) {
          try {
            const fallbackRes = await gemini.models.generateContent({
              model: modelName,
              contents: promptText,
              config: {
                systemInstruction: SYSTEM_PROMPT,
                temperature: GEMINI_TEMP,
                responseMimeType: 'application/json',
                maxOutputTokens: 32768,
              },
            });
            const data = extractJson(fallbackRes.text);
            return PlanSchema.parse(data);
          } catch (e) {
            lastErr = e;
          }
        }
        break;
      }
    }
  }
  throw lastErr;
}

// -------------------------------------------------------------
// ÇOKLU MODEL YÖNLENDİRİCİSİ (Provider Router & Failover)
// -------------------------------------------------------------
async function askAI(promptText, provider = DEFAULT_PROVIDER) {
  const deepseekMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: promptText },
  ];

  if (provider === 'deepseek') {
    try {
      return await askDeepSeek(deepseekMessages);
    } catch (err) {
      if (gemini) {
        console.warn(`[AI-Router] DeepSeek hatası (${err.message}). Gemini'ye otomatik geçiliyor...`);
        return await askGemini(promptText);
      }
      throw err;
    }
  }

  if (provider === 'gemini') {
    return await askGemini(promptText);
  }

  // 'auto' modunda: Öncelikli olarak DeepSeek anahtarı varsa DeepSeek dene, aksi halde Gemini
  if (DEEPSEEK_API_KEY) {
    try {
      return await askDeepSeek(deepseekMessages);
    } catch (err) {
      console.warn(`[AI-Router] DeepSeek hatası: ${err.message}. Gemini deneniyor...`);
      if (gemini) {
        return await askGemini(promptText);
      }
      throw err;
    }
  }

  return await askGemini(promptText);
}

/**
 * 1) Model plan üretir (DeepSeek veya Gemini)
 * 2) builder 3B matrise çevirir ve doğrular
 * 3) Gerekirse onarım turları (repairPrompt) ile düzeltir.
 */
export async function generateStructure(userPrompt, requestedProvider) {
  const provider = requestedProvider || DEFAULT_PROVIDER;
  const request = `Build request:\n${userPrompt}`;
  let best = null,
    lastPlan = null,
    feedback = null,
    rounds = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    rounds++;
    let plan;
    const currentPrompt = round === 0 ? request : repairPrompt(request, lastPlan, feedback);
    try {
      plan = await askAI(currentPrompt, provider);
    } catch (err) {
      feedback = [`Your last answer was not a valid plan JSON: ${String(err.message).slice(0, 300)}`];
      // Eğer doğrudan API kotası/bakiye hatasıysa döngüyü boşuna bekletmeyip hemen kullanıcıya fırlat
      if (
        err.message.includes('Insufficient Balance') ||
        err.message.includes('RESOURCE_EXHAUSTED') ||
        err.message.includes('429')
      ) {
        throw err;
      }
      continue;
    }
    lastPlan = plan;

    let result;
    try {
      result = buildStructure(plan);
    } catch (err) {
      if (!(err instanceof BuildError)) throw err;
      feedback = [err.message];
      continue;
    }
    if (!best || result.major.length < best.result.major.length) best = { result };
    if (result.major.length === 0) break;
    feedback = result.major;
  }

  if (!best) throw new Error(`Model geçerli bir plan üretemedi: ${feedback?.[0]}`);
  const { structure, warnings } = best.result;
  return { ...structure, meta: { warnings, rounds, provider } };
}
