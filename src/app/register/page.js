'use client';

import AuthLayout from "../../components/AuthLayout";
import SignUpForm from "../../components/SignUpForm.js";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Let your imagination"
      subtitle="come to life ✨"
      illustrationSrc="/signup-illustration.png"
      illustrationAlt="Signup Illustration"
    >
      <h2
        style={{
          color: "#3E1D84",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          fontSize: "1.8rem",
        }}
      >
        Create Account
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "#555" }}>Input your details</p>

      <SignUpForm />

      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "#3E1D84",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            Log in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}