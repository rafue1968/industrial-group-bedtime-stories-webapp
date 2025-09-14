"use client";

import { useEffect, useRef, useState } from "react";

const BG = {
  none: null,
  rain: "/ambience/rainstorm.mp3",
  ocean: "/ambience/ocean.mp3",
  breeze: "/ambience/breeze.mp3",
  white: "/ambience/white.mp3",
};

export default function TTSPlayer({
  text,
  voice,      // "male" | "female"
  speed,      // "slow" | "normal" | "fast"
  length,     // optional metadata
  background, // initial ambience choice
  pitch,      // "deep" | "neutral" | "bright"
  tone,       // optional; if present overrides derived tone
}) {
  const [bg, setBg] = useState(background || "none");
  const [bgVol, setBgVol] = useState(0.3);
  const [busy, setBusy] = useState(false);      // generating audio from API
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const speechRef = useRef(null); // HTMLAudioElement for narration
  const bgRef = useRef(null);     // HTMLAudioElement for ambience
  const urlRef = useRef(null);    // blob URL of generated narration

  // Prefer explicit tone if provided; otherwise derive from pitch
  const effectiveTone =
    tone ??
    (pitch === "deep" ? "deep" : pitch === "bright" ? "bright" : "neutral");

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep ambience volume synced
  useEffect(() => {
    if (bgRef.current) bgRef.current.volume = bgVol;
  }, [bgVol]);

  const revokeUrl = () => {
    if (urlRef.current) {
      try {
        URL.revokeObjectURL(urlRef.current);
      } catch {}
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
        // resume ambience if selected
        if (bgRef.current) {
          bgRef.current.play().catch(() => {});
        } else if (bg !== "none") {
          playAmbience();
        }
        await a.play();
        setIsPlaying(true);
        setIsPaused(false);
      } catch {
        // If autoplay fails, leave UI in paused state
      }
    }
  };

  const play = async () => {
    if (!text?.trim() || busy) return;

    // Fresh start from the beginning (re-generate audio)
    stopAll();
    setBusy(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice,               // "male" | "female"
          tone: effectiveTone, // "deep" | "neutral" | "bright"
          pitch,               // send raw UI selection too
          speed,               // "slow" | "normal" | "fast"
          length,
          background: bg,
        }),
      });

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        let reason = `Azure TTS failed (${res.status})`;
        if (ct.includes("application/json")) {
          const j = await res.json().catch(() => ({}));
          if (j?.error) reason = j.error + (j.detail ? ` — ${j.detail}` : "");
        } else {
          const t = await res.text().catch(() => "");
          if (t) reason = `${reason}: ${t.slice(0, 300)}`;
        }
        throw new Error(reason);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      speechRef.current = audio;

      audio.onplay = () => {
        // start ambience when narration actually starts
        playAmbience();
        setIsPlaying(true);
        setIsPaused(false);
        setBusy(false); // generation phase is over
      };

      audio.onpause = () => {
        setIsPlaying(false);
        setIsPaused(true);
        if (bgRef.current && !bgRef.current.paused) bgRef.current.pause();
      };

      audio.onended = () => {
        // finished; reset UI and resources
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
      alert(`Sorry, narration could not be generated.\n${e?.message || ""}`);
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

        {/* Controls */}
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