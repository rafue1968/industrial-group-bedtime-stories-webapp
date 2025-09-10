'use client';

import SignUpForm from '@/components/SignUpForm';
import Link from 'next/link';

export default function RegisterPage() {
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
      <SignUpForm />

      {/* Link to Sign In */}
      <p style={{ marginTop: "1rem", color: "#3E1D84" }}>
        Already have an account?{" "}
        <Link href="/signin" style={{ color: "#B99DD0", fontWeight: "bold" }}>
          Sign in
        </Link>
      </p>
    </main>
  );
}
