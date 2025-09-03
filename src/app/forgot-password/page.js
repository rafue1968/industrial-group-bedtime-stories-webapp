"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Reset link sent! Check your inbox.");
      setEmail("");
    } catch (err) {
      let msg = "Failed to send reset email.";
      if (err?.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (err?.code === "auth/invalid-email") {
        msg = "Enter a valid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="We'll help you reset it 🔑"
      illustrationSrc="/login-illustration.png"
      illustrationAlt="Login illustration reused"
    >
      <h2 style={{ color: "#3E1D84", fontWeight: "bold", marginBottom: "0.5rem" }}>
        Reset your password
      </h2>
      <p style={{ marginBottom: "1.5rem", color: "#555" }}>
        Enter your email and we’ll send you a reset link
      </p>

      <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "0.9rem 1.2rem",
            border: "1.5px solid #B99DD0",
            borderRadius: "25px",
            fontSize: "1rem",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#A088CA" : "#3E1D84",
            color: "white",
            padding: "0.9rem",
            borderRadius: "25px",
            border: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "2px 2px 0px #B99DD0",
          }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link href="/login" style={{ color: "#3E1D84", fontWeight: "bold", textDecoration: "underline" }}>
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}