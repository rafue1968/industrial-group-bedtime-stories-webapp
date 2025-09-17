"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import axios from "axios";
import TTSPlayer from "./TTSPlayer";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function AIGenerator() {

  const [topic, setTopic] = useState("");
  const [summaryId, setSummaryId] = useState(null);
  const [summary, setSummary] = useState("");
  const [storyId, setStoryId] = useState(null);
  const [story, setStory] = useState("");

  const [length, setLength] = useState(10);


  const [voice, setVoice] = useState("female"); 
  const [speed, setSpeed] = useState("normal"); 
  const [pitch, setPitch] = useState("neutral");

  const [loading, setLoading] = useState(false);
  const [genStoryBusy, setGenStoryBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState(null);


    const genreIcons = {
      "Time Travel": "/genres/time-travel.png",
      Fantasy: "/genres/fantasy.png",
      "Sci-Fi": "/genres/sci-fi.png",
      Mindfulness: "/genres/mindfulness.png",
      Adventure: "/genres/adventure.png",
    };

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


  const saveStory = async () => {
    if (!story || !userId, !topic) return;

    try {
        const res = await axios.post("/api/save-story", { story, userId, topic });
        if (res.status === 200) {
          alert(`"${topic}" story is saved successfully in the library!`);
        } else {
          alert("Failed to save story.");
        }
    } catch (err) {
      console.error(err);
      alert("Error saving story.");
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4 font-sans"
      style={{
        fontFamily: "'Arial', sans-serif",
        minHeight: "100vh",
        paddingTop: "6rem",
        marginTop: "6rem",
      }}
    >

      <h2 style={{textAlign:"center", color:"darkmagenta", fontFamily:"cursive"}}>Let's Generate Your Story!</h2>

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

            <div style={{display: "grid", gridTemplateColumns: "repeat(3, 100px)", gap: "1rem", justifyContent: "center", marginBottom: "2rem"}}>
              {Object.entries(genreIcons).map(([name, icon]) => (
                <div key={name}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: topic === name ? "#E3D4F9" : "#EFE6FA",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      boxShadow: topic === name ? "0 10px 25px rgba(62,29,132,0.4)" : "0 4px 10px rgba(62,29,132,0.15)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                    }} 
                    onClick={()=> setTopic(name)}
                    onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(62,29,132,0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = topic === name ? "0 10px 25px rgba(62,29,132,0.4)" : "0 4px 10px rgba(62,29,132,0.15)";
                    }}
                  >
                    <Image src={icon} alt={name} width={60} height={60} style={{ objectFit: "contain"}}   />
                  </div>
                </div>
              ))}
            </div>

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
              disabled={loading || !topic || !userId}
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
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating summary<span className="dots"></span>
                </span>
              ) : (
                "Generate Summary"
              )}
            </button>
          </div>

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
                      cursor: "pointer"
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
        </div>
      </section>
      <section style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "3rem",
          width: "100%",
        }}>

          {story && (
            <div style={{
              backgroundColor: "#D2B6F0",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "3px 3px 0px #3E1D84",
              textAlign: "center",
              width: "70%",
              maxWidth: 960,
            }}>
              <div
                style={{
                  marginTop: "1rem",
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "1px 1px 0px #3E1D84",
                  textAlign: "left",
                  position: "relative"
                }}
              >
                <h3 style={{ color: "#3E1D84", marginBottom: "0.5rem" }}>Full Story</h3>
                <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{story}</p>


                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "1rem",
                      marginTop: "1rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <h4 style={{ color: "#3E1D84" }}>Voice</h4>
                      <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                        <option value=""></option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>

                    <div>
                      <h4 style={{ color: "#3E1D84" }}>Speed</h4>
                      <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
                        <option value=""></option>
                        <option value="normal">Normal</option>
                        <option value="slow">Slow</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ color: "#3E1D84" }}>Pitch</h4>
                    <select value={pitch} onChange={(e) => setPitch(e.target.value)}>
                      <option value=""></option>
                      <option value="deep">Deep</option>
                      <option value="neutral">Neutral</option>
                      <option value="bright">Bright</option>
                    </select>
                  </div>
                </div>

                <TTSPlayer
                  text={story}
                  voice={voice}
                  speed={speed}
                  pitch={pitch}
                />

                <div style={{display: "flex", marginTop: "20px", marginBottom: 0, justifyContent: "end"}}>
                  <button onClick={saveStory} style={{margin: "10px", backgroundColor: "#3E1D84", color: "white", padding: "15px 30px", borderRadius: "20px", border: 0, boxShadow: "0 3px 5px rgba(218, 165, 32, 0.7)", width: "150px", cursor: "pointer"}}><strong>Save Story</strong></button>
                </div>

              </div>
            </div>
          )}
      </section>
    </div>
  );
}