"use client";

import Image from "next/image";
import styles from "./page.module.css";
// import AIGenerator from "../components/AIGenerator";
// import ShowLogIn from "./components/ShowLogIn.js";
import SignInForm from "../components/SignInForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ForgotPasswordForm from "../components/ForgotPassword";

export default function Home() {
  const router =useRouter()
  
  return (
    <main className={styles.main}>
      <h2>Welcome to bed time stories</h2>
      {/* <ShowLogIn /> */}
      <SignInForm />
      <Link href="/register">Don&apos;t have an account? Click here to Sign up</Link>
      {/* <AIGenerator /> */}
     <Link href="/forgotPassword" style={{ color: "#570fafff" }}>
        Forgot password?
      </Link>
    </main>
  );
}