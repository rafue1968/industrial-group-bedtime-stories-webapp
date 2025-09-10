'use client';
import { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import GoogleSignInUp from './GoogleSignInUp';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signSucceeded, setSignSucceeded] = useState('');
  const router = useRouter();

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSignSucceeded('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSignSucceeded('✅ You have successfully signed in!');
      setTimeout(() => router.push('/community'), 1500);
    } catch (err) {
      console.error("❌ Sign-in error:", err);
      setError('❌ Email/password sign-in failed. Please try again.');
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#3E1D84',
        color: 'white',
        padding: '50px',
        borderRadius: '20px',
        width: '400px',
        textAlign: 'center',
        boxShadow: '3px 3px 0px #2B1463',
      }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Sign In</h2>

      {signSucceeded && <p style={{ color: 'lightgreen', marginBottom: '1rem' }}>{signSucceeded}</p>}
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <form 
        onSubmit={handleEmailSignIn} 
        autoComplete="off" 
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.6rem',
            border: 'none',
            borderRadius: '6px',
            height: '60px',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '0.6rem',
            border: 'none',
            borderRadius: '6px',
            height: '60px',
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#B99DD0',
            color: 'white',
            padding: '0.6rem',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '2px 2px 0px #2B1463',
            height: '60px',
          }}
        >
          Sign In with Email
        </button>
      </form>

      {/* Link to forgot password */}
      <p style={{ marginTop: '1rem' }}>
        <Link href="/forgot-password" style={{ color: '#B99DD0', fontWeight: 'bold' }}>
          Forgot password?
        </Link>
      </p>

      <div style={{ margin: '1rem 0' }}>or</div>
      <GoogleSignInUp />

      {/* Link to Sign Up */}
      <p style={{ marginTop: '1rem' }}>
        Don’t have an account?{' '}
        <Link href="/register" style={{ color: '#B99DD0', fontWeight: 'bold' }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}