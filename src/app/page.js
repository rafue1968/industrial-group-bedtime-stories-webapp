"use client";

import Image from "next/image";
import styles from "./page.module.css";
// import AIGenerator from "../components/AIGenerator";
// import ShowLogIn from "./components/ShowLogIn.js";
import SignInForm from "../components/SignInForm";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <h2>Welcome to bed time stories</h2>
      {/* <ShowLogIn /> */}
      <SignInForm />
      <Link href="/register">Don&apos;t have an account? Click here to Sign up</Link>
      {/* <AIGenerator /> */}
    </main>
  );
}