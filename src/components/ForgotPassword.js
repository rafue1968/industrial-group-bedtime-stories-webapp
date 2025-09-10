'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, provider } from '../../lib/firebase';
import Link from 'next/link';
import AuthLayout from './AuthLayout';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const prettyAuthError = (code, message) => {
    switch (code) {
      case 'auth/invalid-email': return 'The email address is invalid.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/missing-email': return 'Please enter your email.';
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
      default: return message || 'Something went wrong. Please try again.';
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setLoading(true);

    const input = email.trim();
    if (!input) {
      setErr('Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, input);
      setMsg('Password reset email sent. Check your inbox (and spam).');
      setEmail('');
    } catch (error) {
      setErr(prettyAuthError(error?.code, error?.message));
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
        {msg && <p style={{ color: "green" }}>{msg}</p>}
        {err && <p style={{ color: "red" }}>{err}</p>}

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