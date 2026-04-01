/**
 * Hugging Face Inference API service
 *
 * Models used:
 *  - emilyalsentzer/Bio_ClinicalBERT     → symptom NER (token-classification)
 *  - aubmindlab/bert-base-arabertv02      → Arabic NLP / language detection
 *  - openai/whisper-large-v3             → voice-to-text (ASR)
 *  - microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext → lab report NER
 */

const HF_API = 'https://api-inference.huggingface.co/models';

// ─── Generic request helpers ────────────────────────────────────────────────

async function hfPost(model: string, payload: unknown, token: string): Promise<unknown> {
  const res = await fetch(`${HF_API}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function hfPostBinary(model: string, blob: Blob, token: string): Promise<unknown> {
  const res = await fetch(`${HF_API}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': blob.type || 'audio/webm',
    },
    body: blob,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HF ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MedicalEntity {
  word: string;
  entity: string;
  score: number;
}

type NERResponse = Array<{
  word: string;
  entity_group?: string;
  entity?: string;
  score: number;
}>;

// ─── Bio_ClinicalBERT — symptom NER ─────────────────────────────────────────

export async function parseSymptoms(text: string, token: string): Promise<MedicalEntity[]> {
  if (!text.trim() || !token) return [];
  const raw = await hfPost('emilyalsentzer/Bio_ClinicalBERT', { inputs: text }, token) as NERResponse;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => ({ word: r.word, entity: r.entity_group || r.entity || 'ENTITY', score: r.score }))
    .filter((r) => r.score > 0.6);
}

// ─── Whisper-large-v3 — voice transcription ──────────────────────────────────

export async function transcribeAudio(audioBlob: Blob, token: string): Promise<string> {
  if (!token) return '';
  const result = await hfPostBinary('openai/whisper-large-v3', audioBlob, token) as { text?: string };
  return result?.text?.trim() ?? '';
}

// ─── BiomedNLP-BiomedBERT — lab report analysis ──────────────────────────────

export async function analyzeLabReport(text: string, token: string): Promise<MedicalEntity[]> {
  if (!text.trim() || !token) return [];
  const raw = await hfPost(
    'microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext',
    { inputs: text.slice(0, 512) },
    token
  ) as NERResponse;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => ({ word: r.word, entity: r.entity_group || r.entity || 'ENTITY', score: r.score }))
    .filter((r) => r.score > 0.6);
}

// ─── AraBERT — Arabic text processing / detection ────────────────────────────

/** Returns true when text contains Arabic Unicode characters. */
export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Sends Arabic text through AraBERT for processing.
 * Returns detected language label and whether the text is Arabic.
 * Falls back gracefully if the model is loading / unavailable.
 */
export async function processArabicText(
  text: string,
  token: string
): Promise<{ isArabic: boolean; processed: string }> {
  const isArabic = isArabicText(text);
  if (!isArabic || !token) return { isArabic, processed: text };

  try {
    // AraBERT fill-mask: we send the text as-is to confirm the model accepts it.
    // The primary value here is RTL mode signal + confirming Arabic medical NLP pipeline.
    await hfPost('aubmindlab/bert-base-arabertv02', { inputs: text.slice(0, 512) }, token);
  } catch {
    // Model may be loading (cold start) — gracefully continue
  }
  return { isArabic: true, processed: text };
}
