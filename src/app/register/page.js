'use client';
import SignUpForm from '../../components/SignUpForm.js';
import Link from "next/link"

export default function RegisterPage() {
  return (
    <main style={{ maxWidth: 400, margin: "auto", padding: 20, textAlign: "center"}}>
      <h1>Create Account</h1>
      <SignUpForm />
      <Link href="/">Already have an account? Click here to Sign in</Link>
    </main>
  );
}