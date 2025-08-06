"use client";

import { useEffect, useState } from "react";
import { auth } from "../../../lib/firebase"; 
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4 font-sans">
      {userId && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md text-sm text-gray-700 border border-gray-200">
          User ID: <span className="font-mono text-blue-600 font-semibold break-all">{userId}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl text-center border border-gray-100">
        <h1 className="text-4xl font-extrabold text-purple-800 mb-6 tracking-tight">
          AI Bedtime Story Generator
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Create amazing bedtime stories with the power of AI!
        </p>

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {["Science", "Time Travel", "Dreams", "Magic Forest", "Space Adventure", "Ocean Mystery"].map((preset) => (
            <button
              key={preset}
              onClick={() => setTopic(preset)}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 text-base"
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Or write your own topic..."
            className="flex-grow px-5 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 text-lg shadow-sm placeholder-gray-400"
            aria-label="Story topic input"
          />
          <button
            onClick={generateSummary}
            disabled={loading || !isAuthReady || !userId || !topic.trim()}
            className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center ${
              loading || !isAuthReady || !userId || !topic.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
            }`}
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

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner min-h-[150px] flex items-center justify-center text-left">
          {summary ? (
            <p className="text-gray-800 text-lg leading-relaxed italic">
              "{summary}"
            </p>
          ) : (
            <p className="text-gray-500 text-lg text-center">
              {loading ? "Generating your magical story summary..." : "No summary generated yet. Pick a topic or write your own, then click 'Generate Summary'!"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
