"use client";

import { useState } from "react";
import db from "../../../firebase"; 
import { collection, addDoc } from "firebase/firestore";

export default function AIGenerator() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");

  const generateSummary = async () => {
    if (!topic.trim()) return;

    const newSummary = `This is a bedtime story summary about "${topic}".`; 
    setSummary(newSummary);

    try {
      await addDoc(collection(db, "summaries"), {
        topic,
        summary: newSummary,
        createdAt: new Date()
      });
      console.log("✅ Summary saved to Firestore");
    } catch (error) {
      console.error("❌ Error saving summary:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Select a Topic</h2>
      <div>
        {["Science", "Time Travel", "Dreams"].map((preset) => (
          <button
            key={preset}
            onClick={() => setTopic(preset)}
            style={{ margin: "0 0.5rem", padding: "0.5rem 1rem" }}
          >
            {preset}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Or write your own topic..."
          style={{ padding: "0.5rem", width: "250px" }}
        />
        <button
          onClick={generateSummary}
          style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem", background: "#0070f3", color: "#fff" }}
        >
          Generate Summary
        </button>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Story Summaries</h3>
        <p>{summary || "No summary generated yet."}</p>
      </div>
    </div>
  );
}
