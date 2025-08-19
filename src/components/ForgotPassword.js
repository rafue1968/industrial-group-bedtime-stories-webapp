'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, provider } from '../../lib/firebase';
import Link from 'next/link';

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

    const input = email.trim();
    if (!input) {
      setErr('Please enter your email.');
      return;
    }

    setLoading(true);
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
    <div style={{color:"black"}}>
      <h2>Forgot Password</h2>

      <p>{msg ? msg : err ? err : ""}</p>

      <form onSubmit={handleReset} autoComplete="off">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <p>
        <Link href="/">Back to Login</Link>
      </p>
    </div>
  );
}
