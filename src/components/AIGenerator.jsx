"use client";

import { useEffect, useState } from "react";
import { auth } from "@lib/firebase"; // client SDK
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import axios from "axios";
import TTSPlayer from "@/components/TTSPlayer";
import { Loader2 } from "lucide-react";

export default function AIGenerator() {
  // phase data
  const [topic, setTopic] = useState("");
  const [summaryId, setSummaryId] = useState(null);
  const [summary, setSummary] = useState("");
  const [storyId, setStoryId] = useState(null);
  const [story, setStory] = useState("");

  // length chosen only when making full story
  const [length, setLength] = useState(10); // 5 | 10 | 20

  // audio controls only AFTER full story
  const [voice, setVoice] = useState("female"); // male | female
  const [speed, setSpeed] = useState("normal"); // slow | normal | fast
  const [pitch, setPitch] = useState("neutral"); // deep | neutral | bright

  // framework state
  const [loading, setLoading] = useState(false);
  const [genStoryBusy, setGenStoryBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState(null);

  // auth (anonymous if needed)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUserId(u.uid);
      else signInAnonymously(auth).then((uc) => setUserId(uc.user.uid));
    });
    return () => unsub();
  }, []);

  const generateSummary = async () => {
    setErrorMessage("");
    setSummary("");
    setSummaryId(null);
    setStory("");
    setStoryId(null);

    if (!topic.trim()) {
      setErrorMessage("Please enter a topic for the story.");
      return;
    }
    if (!userId) {
      setErrorMessage("User not authenticated yet. Please wait and try again.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/save-summary", { topic, userId });
      if (res.status !== 200) throw new Error(res.data?.error || "Failed");
      setSummary(res.data.summary);
      setSummaryId(res.data.summaryId);
    } catch (e) {
      console.error(e);
      setErrorMessage("Could not generate the summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateFullStory = async () => {
    if (!summaryId || !summary) {
      setErrorMessage("Generate a summary first.");
      return;
    }
    try {
      setGenStoryBusy(true);
      setErrorMessage("");
      const res = await axios.post("/api/generate-story", {
        summaryId,
        summaryText: summary,
        userId,
        lengthMinutes: Number(length),
      });
      if (res.status !== 200) throw new Error(res.data?.error || "Failed");
      setStory(res.data.text);
      setStoryId(res.data.storyId);
    } catch (e) {
      console.error(e);
      setErrorMessage("Could not generate the full story. Please try again.");
    } finally {
      setGenStoryBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4 font-sans"
      style={{
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#F4E7F7",
        minHeight: "100vh",
        paddingTop: "6rem",
        marginTop: "6rem",
      }}
    >
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "3rem",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "#D2B6F0",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "3px 3px 0px #3E1D84",
            textAlign: "center",
            width: "70%",
            maxWidth: 960,
          }}
        >
          <h2 style={{ color: "#3E1D84", marginBottom: "1rem" }}>
            Choose your own topic:
          </h2>

          {/* Topic input with examples-like placeholder */}
          <div className="mb-8 flex flex-col items-center justify-center gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Forest at night, Dreams of a fox, Time-traveling kite, Moonlit river"
              style={{
                width: "90%",
                padding: "0.6rem",
                borderRadius: "6px",
                border: "1px solid #3E1D84",
                fontSize: "1rem",
                background: "white",
              }}
            />
            <button
              onClick={generateSummary}
              disabled={loading || !topic.trim() || !userId}
              style={{
                marginTop: "0.25rem",
                backgroundColor: "#3E1D84",
                color: "white",
                padding: "0.8rem 1.5rem",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "3px 3px 0px #2B1463",
                minWidth: 220,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating summary…
                </span>
              ) : (
                "Generate Summary"
              )}
            </button>
          </div>

          {/* Errors */}
          {errorMessage && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-left"
              style={{ marginTop: "1rem" }}
              role="alert"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline ml-2">{errorMessage}</span>
            </div>
          )}

          {/* Summary card */}
          <div style={{ marginTop: "1rem" }}>
            {summary ? (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "1px 1px 0px #3E1D84",
                  textAlign: "left",
                }}
              >
                <h3 style={{ color: "#3E1D84", marginBottom: "0.5rem" }}>Summary</h3>
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{summary}</p>

                {/* Only the length control + Generate Full Story */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "0.75rem" }}>
                  <label>
                    Length:&nbsp;
                    <select
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                    >
                      <option value={5}>~5 mins</option>
                      <option value={10}>~10 mins</option>
                      <option value={20}>~20 mins</option>
                    </select>
                  </label>
                  <button
                    onClick={generateFullStory}
                    disabled={genStoryBusy}
                    style={{
                      backgroundColor: "#3E1D84",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "2px 2px 0px #2B1463",
                    }}
                  >
                    {genStoryBusy ? "Expanding…" : "Generate Full Story"}
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  backgroundColor: "white",
                  margin: "10px auto",
                  borderRadius: "10px",
                  width: "fit-content",
                  padding: "10px",
                }}
              >
                {loading
                  ? "Generating your magical story summary…"
                  : "No summary yet. Enter a topic and click ‘Generate Summary’!"}
              </p>
            )}
          </div>

          {/* Full Story + Audio controls (only appear after story exists) */}
          {story && (
            <div
              style={{
                marginTop: "1rem",
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "10px",
                boxShadow: "1px 1px 0px #3E1D84",
                textAlign: "left",
              }}
            >
              <h3 style={{ color: "#3E1D84", marginBottom: "0.5rem" }}>Full Story</h3>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{story}</p>

              {/* Audio controls shown only now */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "1rem",
                  marginTop: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <h4 style={{ color: "#3E1D84" }}>Voice</h4>
                  <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <h4 style={{ color: "#3E1D84" }}>Speed</h4>
                  <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="slow">Slow</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <div>
                  <h4 style={{ color: "#3E1D84" }}>Pitch</h4>
                  <select value={pitch} onChange={(e) => setPitch(e.target.value)}>
                    <option value="deep">Deep</option>
                    <option value="neutral">Neutral</option>
                    <option value="bright">Bright</option>
                  </select>
                </div>
              </div>

              {/* Player (background chooser lives inside TTSPlayer) */}
              <TTSPlayer
                text={story}
                // pass compact, unambiguous props expected by /api/tts
                voice={voice}
                speed={speed}
                pitch={pitch}
              />

              {storyId && (
                <p style={{ marginTop: 8 }}>
                  Share link: <a href={`/story/${storyId}`}>/story/{storyId}</a>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
