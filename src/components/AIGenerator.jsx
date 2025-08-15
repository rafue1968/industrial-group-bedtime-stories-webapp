"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase"; 
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function AIGenerator() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth)
          .then((userCredential) => {
            setUserId(userCredential.user.uid);
          })
          .catch((error) => {
            console.error("Anonymous sign-in error:", error);
            setErrorMessage(`Authentication failed: ${error.message}. Please refresh.`);
          })
          .finally(() => {
            setIsAuthReady(true);
          });
      }
      if (user) {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    setSummary("");
    setErrorMessage("");

    if (!topic.trim()) {
      setErrorMessage("Please enter a topic for the story.");
      setLoading(false);
      return;
    }
    if (!isAuthReady || !userId) {
      setErrorMessage("User not authenticated. Please wait or refresh the page.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/save-summary", {
        topic: topic,
        userId: userId,
      });

      const { summary: aiGeneratedText } = response.data;
      setSummary(aiGeneratedText);
      console.log("Summary received and saved successfully.");
    } catch (error) {
      console.error("Error during API call:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.error || "Sorry, an unexpected error occurred. Please try again.");
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4 font-sans" 
        style={{
            fontFamily: "'Arial', sans-serif",
            backgroundColor: "#F4E7F7",
            minHeight: "100vh",
            paddingTop: "6rem",
            // display: "flex",
            // justifyContent: "center",
            marginTop: "6rem"
      }}>

        <section style={{
          display:"flex",
          justifyContent:"center",
          marginTop:"3rem"
        }}>

          <div style={{
                backgroundColor: "#D2B6F0",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "3px 3px 0px #3E1D84",
                textAlign: "center",
                width: "60%",
              }} >

            <h2 style={{ color: "#3E1D84", marginBottom: "1rem" }} >
              Choose your own topic:
            </h2>

            <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., Quantum tunnels, Forest at night)"
                style={{
                  width: "80%",
                  padding: "0.5rem",
                  marginBottom: "1.5rem",
                  borderRadius: "6px",
                  border: "1px solid #3E1D84",
                  fontSize: "1rem",
                }}
              />

                <div style={{ display: "flex", justifyContent: "space-around" }}>
                  <div>
                    <h3 style={{ color: "#3E1D84" }}>Voice:</h3>
                    <p>Male</p>
                    <p>Female</p>
                    <p>Deep</p>
                    <p>Calm</p>
                  </div>

                  <div>
                    <h3 style={{ color: "#3E1D84" }}>Length:</h3>
                    <p>5 mins</p>
                    <p>10 mins</p>
                    <p>20 mins</p>
                    <input
                      type="text"
                      placeholder="Input yours"
                      style={{
                        marginTop: "0.5rem",
                        borderRadius: "6px",
                        border: "1px solid #3E1D84",
                        padding: "0.3rem",
                      }}
                    />
                  </div>

                  <div>
                    <h3 style={{ color: "#3E1D84" }}>Speed:</h3>
                    <p>Normal</p>
                    <p>Slow</p>
                    <p>Very Slow</p>
                    <p>Fast</p>
                  </div>
              </div>

              <button
                onClick={generateSummary}
                disabled={loading || !isAuthReady || !userId || !topic.trim()}
                style={{
                  marginTop: "1.5rem",
                  backgroundColor: "#3E1D84",
                  color: "white",
                  padding: "0.8rem 1.5rem",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "3px 3px 0px #2B1463",
                }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                  </span>
                ) : (
                  "Generate Summary"
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-left" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{errorMessage}</span>
              </div>
            )}

            <div>
              {summary ? (
                <p>
                  "{summary}"
                </p>
              ) : (
                <p style={{backgroundColor: "white", margin: "10px", borderRadius: "10px", width: "fit-content", padding: "10px", justifyContent: "center"}}>
                  {loading ? "Generating your magical story summary..." : "No summary generated yet. Pick a topic or write your own, then click 'Generate Summary'!"}
                </p>
              )}
            </div>
          </div>
      </section>
    </div>
  );
}