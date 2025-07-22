<<<<<<< HEAD
"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

/* 
  ===== Developer Notes (Daniel) =====
  Role: React + AI Integration
  Changes:
  - Replaced boilerplate content with Topic Picker + Custom Input + Generate Button
  - Added dummy summaries display (to simulate AI response)
  - Used useState() to handle selected topic, input, and summaries
  - Placeholder logic to be replaced with real AI API (e.g. OpenAI) in next phase
*/

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

    // Dummy summaries (will be replaced with API response)
    const dummySummaries = [
      `Summary 1 about ${topicToUse}`,
      `Summary 2 about ${topicToUse}`,
      `Summary 3 about ${topicToUse}`,
    ];
    setSummaries(dummySummaries);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>🧠 Sleeping AI — Story Generator</h1>

        <section className={styles.section}>
          <h2>Select a Topic</h2>
          <div className={styles.topicButtons}>
            {predefinedTopics.map((topic, index) => (
              <button
                key={index}
                className={styles.topicButton}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCustomTopic(""); // clear input if button clicked
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Or type a custom topic..."
            value={customTopic}
            onChange={(e) => {
              setCustomTopic(e.target.value);
              setSelectedTopic(""); // clear selected if typing
            }}
            className={styles.input}
          />

          <button onClick={handleGenerate} className={styles.generateButton}>
            Generate Summaries
          </button>
        </section>

        <section className={styles.section}>
          <h2>Story Summaries</h2>
          {summaries.length > 0 ? (
            <div className={styles.summaryGrid}>
              {summaries.map((summary, index) => (
                <div key={index} className={styles.summaryCard}>
                  <p>{summary}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No summaries yet. Select a topic and click "Generate".</p>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Sleeping AI — Industrial Project 2025</p>
=======
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
            Get started by editing <code>src/app/page.js</code>.
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
>>>>>>> 60c4386 (Clean initial commit with Firebase and Next.js setup)
      </footer>
    </div>
  );
}
