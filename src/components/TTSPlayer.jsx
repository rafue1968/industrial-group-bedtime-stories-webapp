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

  useEffect(() => {
    return () => stopAll();
  }, []);

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
        if (bgRef.current) {
          bgRef.current.play().catch(() => {});
        } else if (bg !== "none") {
          playAmbience();
        }
        await a.play();
        setIsPlaying(true);
        setIsPaused(false);
      } catch {
      }
    }
  };

  const play = async () => {
    if (!text?.trim() || busy) return;

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
          pitch,               
          speed,              
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