"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Azure-only TTS player with ambience.
 * Props:
 *   text: required
 *   voice: "male" | "female"
 *   speed: "normal" | "slow" | "fast"
 *   pitch: "deep" | "neutral" | "bright"   <-- accepted (mapped to Azure "tone")
 *   tone:  "deep" | "neutral" | "bright"   <-- optional explicit override
 *   length: "short" | "medium" | "long" (handled in backend)
 *   background: "none" | "rain" | "ocean" | "breeze" | "white"
 */
const BG = {
  none: null,
  rain: "/ambience/rain.mp3",
  ocean: "/ambience/ocean.mp3",
  breeze: "/ambience/breeze.mp3",
  white: "/ambience/white.mp3",
};

export default function TTSPlayer({
  text,
  voice,
  speed,
  length,
  background,
  pitch, // callers pass this today
  tone,  // optional explicit tone override
}) {
  const [bg, setBg] = useState(background || "none");
  const [bgVol, setBgVol] = useState(0.3);
  const [busy, setBusy] = useState(false);

  const speechRef = useRef(null);
  const bgRef = useRef(null);
  const urlRef = useRef(null);

  // Backward compatibility: if `tone` not provided, derive from `pitch`
  const effectiveTone =
    tone ??
    (pitch === "deep" ? "deep" : pitch === "bright" ? "bright" : "neutral");

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (bgRef.current) bgRef.current.volume = bgVol;
  }, [bgVol]);

  const stopAll = () => {
    if (speechRef.current) {
      try {
        speechRef.current.pause();
        speechRef.current.currentTime = 0;
      } catch {}
    }
    if (bgRef.current) {
      try {
        bgRef.current.pause();
        bgRef.current.currentTime = 0;
      } catch {}
      bgRef.current = null;
    }
  };

  const playBg = () => {
    const src = BG[bg];
    if (!src) return;
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = bgVol;
    bgRef.current = audio;
    audio.play().catch(() => {});
  };

  const play = async () => {
    if (!text?.trim()) return;
    stopAll();
    setBusy(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice,
          tone: effectiveTone,
          speed,
          length,
          background: bg,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Azure TTS failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      speechRef.current = audio;
      audio.onplay = () => playBg();
      audio.onended = () => {
        stopAll();
        setBusy(false);
      };
      await audio.play();
    } catch (e) {
      console.error(e);
      setBusy(false);
      alert("Sorry, narration could not be generated.");
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
              onChange={(e) => setBg(+e.target.value)}
            />
          </label>
        )}

        <button onClick={play} disabled={busy}>
          {busy ? "Generating…" : "▶ Play"}
        </button>
        <button onClick={stopAll}>⏹ Stop</button>
      </div>
    </div>
  );
}
