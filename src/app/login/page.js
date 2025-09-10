"use client";

import AuthLayout from "../../components/AuthLayout";
import SignInForm from "../../components/SignInForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Let your imagination"
      subtitle="come to life 🔐"
      illustrationSrc="/login-illustration.png"
      illustrationAlt="Login Illustration"
    >
      <h2 style={{ color: "#3E1D84", fontWeight: "bold", marginBottom: "0.5rem", fontSize: "1.6rem" }}>Login</h2>
      <p style={{ marginBottom: "1.5rem", color: "#555" }}>Input your details</p>

      <SignInForm />

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <p style={{ marginBottom: "0.8rem", fontSize: "0.95rem" }}>
          Don’t have an account?{" "}
          <Link href="/register" style={{ color: "#3E1D84", fontWeight: "bold", textDecoration: "underline" }}>
            Sign up here
          </Link>
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          <Link href="/forgot-password" style={{ color: "#8649C0", fontWeight: "bold", textDecoration: "underline" }}>
            Forgot password?
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}