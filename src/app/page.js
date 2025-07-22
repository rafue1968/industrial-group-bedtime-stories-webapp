"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

// ===== Developer Notes (Daniel) =====
// Role: React + AI Integration
// Changes:
// - Replaced boilerplate content with Topic Picker + Custom Input + Generate Button
// - Added dummy summaries display (to simulate AI response)
// - Used useState() to handle selected topic, input, and summaries
// - Placeholder logic to be replaced with real AI API (e.g. OpenAI) in next phase

export default function Home() {
  const predefinedTopics = ["Science", "Time Travel", "Dreams"];
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [summaries, setSummaries] = useState([]);

  const handleGenerate = () => {
    const topicToUse = customTopic || selectedTopic;
    if (!topicToUse) {
      alert("Please choose or enter a topic.");
      return;
    }

    // Placeholder for AI API call – replace with actual backend logic later
    const dummyResponse = [
      `Once upon a time in the world of ${topicToUse}, something magical happened...`,
      `In the heart of ${topicToUse}, a young explorer discovered a secret that changed everything.`,
    ];
    setSummaries(dummyResponse);
  };

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by selecting a topic&nbsp;
          <code className={styles.code}>or create your own</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      {/* ===== Topic Picker + Input UI ===== */}
      <div className={styles.topicSection}>
        <h2>Select a Topic</h2>
        <div className={styles.topicButtons}>
          {predefinedTopics.map((topic) => (
            <button
              key={topic}
              className={selectedTopic === topic ? styles.selected : ""}
              onClick={() => {
                setSelectedTopic(topic);
                setCustomTopic("");
              }}
            >
              {topic}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Or write your own topic..."
          value={customTopic}
          onChange={(e) => {
            setCustomTopic(e.target.value);
            setSelectedTopic("");
          }}
          className={styles.inputBox}
        />
        <button className={styles.generateBtn} onClick={handleGenerate}>
          Generate Summary
        </button>
      </div>

      {/* ===== Summaries Output Section ===== */}
      <div className={styles.summarySection}>
        <h2>Story Summaries</h2>
        {summaries.map((summary, index) => (
          <p key={index} className={styles.summaryCard}>
            {summary}
          </p>
        ))}
      </div>
    </main>
  );
}
