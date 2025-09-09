// src/app/api/tts/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";

// Azure voice names
const VOICE_MAP = {
  female: "en-US-AriaNeural",
  male: "en-US-GuyNeural",
};

// Speed → rate
const SPEED_TO_RATE = {
  slow: "-20%",
  normal: "0%",
  fast: "+20%",
};

// Pitch options → pitch %
const PITCH_TO_VAL = {
  deep: "-10%",
  neutral: "0%",
  bright: "+10%",
};

function escapeXml(s = "") {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function POST(req) {
  try {
    const { text, voice = "female", speed = "normal", pitch = "neutral" } =
      await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (!process.env.AZURE_TTS_KEY || !process.env.AZURE_TTS_REGION) {
      return NextResponse.json(
        { error: "Azure Speech not configured (AZURE_TTS_KEY / AZURE_TTS_REGION)" },
        { status: 500 }
      );
    }

    const voiceName = VOICE_MAP[voice] ?? VOICE_MAP.female;
    const rate = SPEED_TO_RATE[speed] ?? "0%";
    const pitchVal = PITCH_TO_VAL[pitch] ?? "0%";

    const ssml = `
<speak version="1.0" xml:lang="en-US">
  <voice name="${voiceName}">
    <prosody rate="${rate}" pitch="${pitchVal}">
      ${escapeXml(text)}
    </prosody>
  </voice>
</speak>`.trim();

    const url = `https://${process.env.AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.AZURE_TTS_KEY,
        "Content-Type": "application/ssml+xml; charset=utf-8",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      },
      body: ssml,
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Azure TTS HTTP error:", res.status, errBody);
      return NextResponse.json(
        { error: `Azure TTS ${res.status}: ${errBody}` },
        { status: res.status }
      );
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer());
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("TTS route exception:", e?.message || e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
