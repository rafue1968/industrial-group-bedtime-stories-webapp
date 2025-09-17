export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const KEY = process.env.AZURE_TTS_KEY;
const REGION = process.env.AZURE_TTS_REGION;

const VOICES = {
  female: process.env.AZURE_TTS_VOICE_FEMALE || "en-GB-LibbyNeural",
  male: process.env.AZURE_TTS_VOICE_MALE || "en-GB-RyanNeural",
};

const RATE  = { slow: "-20%", normal: "0%", fast: "+20%" };
const PITCH = { deep: "-10%", neutral: "0%", bright: "+20%" }; 

const CHUNK_CHARS = 1700;
const MAX_CHUNKS  = 25;
const OUTPUT_FMT  = "audio-24khz-48kbitrate-mono-mp3";

const AZURE_TTS_URL    = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
const AZURE_VOICES_URL = `https://${REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`;

function isMale(v) {
  const s = String(v || "").trim().toLowerCase();
  return s === "male" || s === "m";
}

function escapeXml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
const pickRate  = (speed = "normal") => RATE[speed] ?? RATE.normal;
function pickPitch(tone, pitch) {
  const k = (tone || pitch || "neutral").toLowerCase();
  if (k === "deep") return PITCH.deep;
  if (k === "bright") return PITCH.bright;
  return PITCH.neutral;
}
function pickVoiceName(requested = "female") {
  return VOICES[isMale(requested) ? "male" : "female"];
}
function voiceLocale(voiceName) {
  const m = /^([a-z]{2}-[A-Z]{2})-/.exec(voiceName || "");
  return m ? m[1] : "en-US";
}
function hintFromStatus(status, body = "") {
  const b = (body || "").toLowerCase();
  if (status === 401 || status === 403) return "Invalid subscription key or region mismatch.";
  if (status === 404) return "Region/endpoint incorrect. Check AZURE_TTS_REGION.";
  if (status === 415) return "Unsupported media type. Use application/ssml+xml.";
  if (status === 400) {
    if (b.includes("voice")) return "Requested voice not available for this region/locale.";
    if (b.includes("ssml")) return "SSML validation error.";
    if (b.includes("length") || b.includes("too long")) return "Text too long for a single request.";
    return "Bad request to Azure TTS (check voice/SSML).";
  }
  return "Azure TTS server error.";
}

async function fetchWithTimeout(url, init, ms = 30000) {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctl.signal });
  } finally {
    clearTimeout(id);
  }
}

async function listVoices() {
  try {
    const r = await fetchWithTimeout(AZURE_VOICES_URL, {
      headers: {
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/json",
      },
    }, 10000);
    if (!r.ok) return [];
    return await r.json();
  } catch { return []; }
}

function chooseFallback(voices, wantMale = false) {
  if (!Array.isArray(voices) || !voices.length) return null;

  const desiredGender = wantMale ? "male" : "female";

  const byLocaleGender = (loc) =>
    voices.filter(
      (v) =>
        (v.Locale || "").startsWith(loc) &&
        (v.Gender || "").toLowerCase() === desiredGender
    );

  let pool = byLocaleGender("en-GB");
  if (!pool.length) pool = byLocaleGender("en-US");
  if (!pool.length) {
    pool = voices.filter(
      (v) => (v.Locale || "").startsWith("en-") && (v.Gender || "").toLowerCase() === desiredGender
    );
  }
  if (!pool.length) return null;

  const prefNames = wantMale
    ? ["Ryan", "Guy", "George", "Aaron", "Tony"]
    : ["Libby", "Jenny", "Michelle", "Ava", "Sonia", "Aria"];

  const byName = pool.find((v) => prefNames.some((n) => (v.ShortName || v.Name || "").includes(n)));
  const pick = byName || pool[0];
  return (pick?.ShortName || pick?.Name) || null;
}

function splitIntoChunks(text, maxChars = CHUNK_CHARS) {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentRe = /(.+?[.!?…]['")]*)(\s+|$)/g;
  const sentences = [];
  let m;
  while ((m = sentRe.exec(clean))) sentences.push(m[1]);

  const chunks = [];
  let buf = "";
  const pushBuf = () => { if (buf) { chunks.push(buf.trim()); buf = ""; } };

  if (!sentences.length) {
    for (let i = 0; i < clean.length; i += maxChars) chunks.push(clean.slice(i, i + maxChars));
    return chunks;
  }

  for (const s of sentences) {
    if ((buf + " " + s).trim().length <= maxChars) {
      buf = (buf + " " + s).trim();
    } else {
      pushBuf();
      if (s.length <= maxChars) buf = s;
      else {
        for (let i = 0; i < s.length; i += maxChars) chunks.push(s.slice(i, i + maxChars));
      }
    }
  }
  pushBuf();
  return chunks;
}

function makeSSML({ chunkText, voiceName, rate, pitchVal, lang }) {
  const safe = escapeXml(chunkText);
  return `<?xml version="1.0" encoding="UTF-8"?>
<speak version="1.0" xml:lang="${lang}" xmlns="http://www.w3.org/2001/10/synthesis">
  <voice name="${voiceName}">
    <prosody rate="${rate}" pitch="${pitchVal}">${safe}</prosody>
  </voice>
</speak>`;
}

async function callAzureOnce(ssml) {
  try {
    return await fetchWithTimeout(AZURE_TTS_URL, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": KEY,
        "Content-Type": "application/ssml+xml; charset=utf-8",
        "X-Microsoft-OutputFormat": OUTPUT_FMT,
        "User-Agent": "SleepingAI/1.0",
        Connection: "keep-alive",
      },
      body: ssml,
    }, 30000);
  } catch (err) {
    const msg = String(err?.message || err || "");
    if (msg.includes("aborted") || msg.includes("terminated") || msg.includes("ECONNRESET")) {
      return await fetchWithTimeout(AZURE_TTS_URL, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": KEY,
          "Content-Type": "application/ssml+xml; charset=utf-8",
          "X-Microsoft-OutputFormat": OUTPUT_FMT,
          "User-Agent": "SleepingAI/1.0",
          Connection: "keep-alive",
        },
        body: ssml,
      }, 30000);
    }
    throw err;
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { text, voice = "female", speed = "normal", tone, pitch } = body || {};

    if (!text?.trim()) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (!KEY || !REGION) {
      return NextResponse.json(
        { error: "Azure Speech not configured (AZURE_TTS_KEY / AZURE_TTS_REGION)" },
        { status: 500 }
      );
    }

    const requestedMale = isMale(voice);
    let chosenVoice = pickVoiceName(voice);     
    let chosenLang  = voiceLocale(chosenVoice);
    const rate      = pickRate(speed);
    const pitchVal  = pickPitch(tone, pitch);

    const chunks = splitIntoChunks(String(text));
    if (chunks.length > MAX_CHUNKS) {
      return NextResponse.json(
        { error: `Story is too long (${chunks.length} chunks > ${MAX_CHUNKS}). Try a shorter length.` },
        { status: 400 }
      );
    }

    const audioParts = [];

    for (let i = 0; i < chunks.length; i++) {
      const ssml = makeSSML({
        chunkText: chunks[i],
        voiceName: chosenVoice,
        rate,
        pitchVal,
        lang: chosenLang,
      });

      let r = await callAzureOnce(ssml);

      if (!r.ok) {
        const errText = await r.text().catch(() => "");
        if (r.status === 400 && /voice/i.test(errText)) {
          const voices = await listVoices();
          const fb = chooseFallback(voices, requestedMale);
          if (!fb) {
            return NextResponse.json(
              { error: `No ${requestedMale ? "male" : "female"} English neural voice available in this region. Set AZURE_TTS_VOICE_${requestedMale ? "MALE" : "FEMALE"} in .env.local to a valid name.` },
              { status: 500 }
            );
          }
          if (fb !== chosenVoice) {
            chosenVoice = fb;
            chosenLang  = voiceLocale(chosenVoice);
          }
          const ssmlFb = makeSSML({
            chunkText: chunks[i],
            voiceName: chosenVoice,
            rate,
            pitchVal,
            lang: chosenLang,
          });
          r = await callAzureOnce(ssmlFb);
        }
      }

      if (!r.ok) {
        const errText = await r.text().catch(() => "");
        return NextResponse.json(
          { error: hintFromStatus(r.status, errText), detail: errText?.slice(0, 300) || null },
          { status: 500 }
        );
      }

      const buf = new Uint8Array(await r.arrayBuffer());
      audioParts.push(buf);
    }

    const totalBytes = audioParts.reduce((n, a) => n + a.byteLength, 0);
    const merged = new Uint8Array(totalBytes);
    let offset = 0;
    for (const part of audioParts) {
      merged.set(part, offset);
      offset += part.byteLength;
    }

    return new Response(merged, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Selected-Voice": chosenVoice, 
      },
    });
  } catch (e) {
    console.error("TTS route exception:", e);
    return NextResponse.json(
      { error: `Server error while generating audio: ${e?.message || e}` },
      { status: 500 }
    );
  }
}