"use client";

import Image from "next/image";
import styles from "./page.module.css";
import AIGenerator from "./components/AIGenerator";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by selecting a topic&nbsp;
          <code className={styles.code}>or create your own</code>
        </p>
        <div>
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
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

      <AIGenerator />
    </main>
  );
}
