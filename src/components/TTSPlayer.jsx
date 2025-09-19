"use client";

import { useEffect, useRef, useState } from "react";

const BG = {
  none: null,
  rain: "/ambience/rainstorm.mp3",
  ocean: "/ambience/ocean.mp3",
  breeze: "/ambience/breeze.mp3",
  white: "/ambience/white.mp3",
};

const audioCache = new Map();

function hashKey({ text, voice, tone, speed, length }) {
  const s = JSON.stringify({ t: text, v: voice, o: tone, s: speed, l: length || 0 });
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
  return h.toString(16);
}

async function fetchWithRetry(url, init, { tries = 3, baseMs = 600 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, init);
    if (res.ok) return res;

    if (res.status === 429 || res.status === 503 || res.status === 502 || res.status === 504) {
      const txt = await res.text().catch(() => "");
      lastErr = new Error(`TTS throttled (${res.status})${txt ? `: ${txt.slice(0, 200)}` : ""}`);
      const retryAfter = parseInt(res.headers.get("Retry-After") || "", 10);
      const delay = Number.isFinite(retryAfter)
        ? Math.min(retryAfter * 1000, 5000)
        : Math.min(baseMs * Math.pow(2, i) + Math.random() * 250, 4000);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || `Azure TTS failed (${res.status})`);
    } else {
      const t = await res.text().catch(() => "");
      throw new Error(`Azure TTS failed (${res.status})${t ? `: ${t.slice(0, 300)}` : ""}`);
    }
  }
  throw lastErr || new Error("Azure TTS throttled. Please try again in a moment.");
}


export default function TTSPlayer({
  text,
  voice,
  speed,
  length, 
  background, 
  pitch, 
  tone,
}) {
  const [bg, setBg] = useState(background || "none");
  const [bgVol, setBgVol] = useState(0.3);
  const [busy, setBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speechRef = useRef(null);
  const bgRef = useRef(null);
  const urlRef = useRef(null);

  const effectiveTone =
    tone ??
    (pitch === "deep" ? "deep" : pitch === "bright" ? "bright" : "neutral");

  useEffect(() => () => stopAll(), []);

  useEffect(() => {
    if (bgRef.current) bgRef.current.volume = bgVol;
  }, [bgVol]);

  const revokeUrl = () => {
    if (urlRef.current) {
      try { URL.revokeObjectURL(urlRef.current); } catch {}
      urlRef.current = null;
    }
  };

  const stopAmbience = () => {
    if (!bgRef.current) return;
    try {
      bgRef.current.pause();
      bgRef.current.currentTime = 0;
    } catch {}
    bgRef.current = null;
  };

  const playAmbience = () => {
    const src = BG[bg];
    if (!src) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = bgVol;
    bgRef.current = audio;
    audio.play().catch(() => {});
  };

  const stopAll = () => {
    try {
      if (speechRef.current) {
        speechRef.current.pause();
        speechRef.current.currentTime = 0;
      }
    } catch {}
    stopAmbience();
    revokeUrl();
    setBusy(false);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const pause = () => {
    const a = speechRef.current;
    if (!a) return;
    if (!a.paused) {
      try {
        a.pause();
        if (bgRef.current && !bgRef.current.paused) bgRef.current.pause();
      } catch {}
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const resume = async () => {
    const a = speechRef.current;
    if (!a) return;
    if (a.paused && a.currentTime > 0) {
      try {
        if (bgRef.current) {
          bgRef.current.play().catch(() => {});
        } else if (bg !== "none") {
          playAmbience();
        }
        await a.play();
        setIsPlaying(true);
        setIsPaused(false);
      } catch {}
    }
  };

  const play = async () => {
    if (!text?.trim() || busy) return;

    stopAll();
    setBusy(true);

    const key = hashKey({ text, voice, tone: effectiveTone, speed, length });

    try {
      let url = audioCache.get(key);

      if (!url) {
        const res = await fetchWithRetry(
          "/api/tts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              voice,
              tone: effectiveTone,
              pitch,
              speed,
              length,
              background: bg,
            }),
          },
          { tries: 3, baseMs: 700 }
        );

        const blob = await res.blob();
        url = URL.createObjectURL(blob);
        audioCache.set(key, url);
      }

      urlRef.current = url;
      const audio = new Audio(url);
      speechRef.current = audio;

      audio.onplay = () => {
        playAmbience();
        setIsPlaying(true);
        setIsPaused(false);
        setBusy(false);
      };

      audio.onpause = () => {
        setIsPlaying(false);
        setIsPaused(true);
        if (bgRef.current && !bgRef.current.paused) bgRef.current.pause();
      };

      audio.onended = () => {
        stopAll();
      };

      audio.onerror = () => {
        console.error("Narration audio error");
        stopAll();
        alert("Sorry, narration could not be played.");
      };

      await audio.play();
    } catch (e) {
      console.error(e);
      setBusy(false);
      const msg = String(e?.message || e);
      if (msg.includes("(429)") || /throttled/i.test(msg)) {
        alert("We’re synthesizing a lot right now. Please try again in a few seconds.");
      } else {
        alert(`Sorry, narration could not be generated.\n${msg}`);
      }
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label>
          Background:&nbsp;
          <select value={bg} onChange={(e) => setBg(e.target.value)}>
            <option value="none">None</option>
            <option value="rain">Rainstorm</option>
            <option value="ocean">Ocean Waves</option>
            <option value="breeze">Gentle Breeze</option>
            <option value="white">White Noise</option>
          </select>
        </label>

        {bg !== "none" && (
          <label>
            Vol:&nbsp;
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={bgVol}
              onChange={(e) => setBgVol(+e.target.value)}
              aria-label="Background volume"
            />
          </label>
        )}

        <button onClick={play} disabled={busy || isPlaying || isPaused} aria-label="Play narration">
          {busy ? "Generating…" : "▶ Play"}
        </button>

        <button onClick={pause} disabled={!isPlaying} aria-label="Pause narration">
          ❚❚ Pause
        </button>

        <button onClick={resume} disabled={!isPaused} aria-label="Resume narration">
          ► Resume
        </button>

        <button
          onClick={stopAll}
          disabled={!isPlaying && !isPaused && !busy}
          aria-label="Stop narration"
        >
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}
