'use client';

import ForgotPasswordForm from '@/components/ForgotPasseord'; // 👈 check the spelling matches your file
import Link from 'next/link';

export default function ForgotPasswordPage() {
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
      <ForgotPasswordForm />

      <p style={{ marginTop: "1rem", color: "#3E1D84" }}>
        Remembered your password?{" "}
        <Link href="/signin" style={{ color: "#B99DD0", fontWeight: "bold" }}>
          Sign in
        </Link>
      </p>
    </main>
  );
}
