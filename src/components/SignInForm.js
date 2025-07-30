'use client';
import { useState } from 'react';
import { auth, provider } from '@/FirebaseConfig'; // adjust path
import { signInWithEmailAndPassword } from 'firebase/auth';
import GoogleSignInUp from './GoogleSignInUp';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signSucceeded, setSignSucceeded] = useState('');

  // Handle email/password sign-in
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSignSucceeded('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSignSucceeded('Well done');
    } catch (err) {
      setError('Email/password sign-in failed: ' + err.message);
    }
  };

  return (
    <div>
      {/* Email/password login */}
      <form onSubmit={handleEmailSignIn}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign in with Email</button>
      </form>
      {signSucceeded && <p style={{ color: 'green' }}>{signSucceeded}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>or</div>
      {/* Google login */}
      <GoogleSignInUp />
    </div>
  );
}
