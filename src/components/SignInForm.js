'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import GoogleSignInUp from './GoogleSignInUp';
import { useRouter } from 'next/navigation';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const router = useRouter();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err) {
      setError('Email/password sign-in failed. Please try again.');
    }
  };

  return (
    <form 
      onSubmit={handleEmailSignIn} 
      autoComplete="off"
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      {error && <p style={{ color: 'red', fontSize: "0.9rem" }}>{error}</p>}

      {/* Email Input */}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "30px",
          border: "1px solid #ccc",
          fontSize: "1rem"
        }}
      />

      {/* Password Input */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "30px",
          border: "1px solid #ccc",
          fontSize: "1rem"
        }}
      />

      {/* Purple button */}
      <button 
        type="submit"
        style={{
          backgroundColor: "#3E1D84",
          color: "white",
          padding: "0.9rem",
          borderRadius: "30px",
          border: "none",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        Sign in with Email
      </button>

      {/* Google button + divider handled inside GoogleSignInUp (same as Register) */}
      <GoogleSignInUp />
    </form>
  );
}