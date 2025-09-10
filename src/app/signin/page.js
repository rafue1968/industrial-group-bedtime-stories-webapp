'use client';

import SignInForm from '@/components/SignInForm';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4E7F7",
        padding: "20px",
        flexDirection: "column",
      }}
    >
      <SignInForm />

      {/* Link to Sign Up */}
      <p style={{ marginTop: "1rem", color: "#3E1D84" }}>
        Don’t have an account?{" "}
        <Link href="/register" style={{ color: "#B99DD0", fontWeight: "bold" }}>
          Sign up
        </Link>
      </p>
    </main>
  );
}
