'use client';
import { useState } from 'react';
import { auth, provider } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import GoogleSignInUp from './GoogleSignInUp';
import { useRouter } from 'next/navigation';

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
      setSignSucceeded('You have successfully signed in!');
      alert("You have successfully signed in!");
      router.push("/community")

    } catch (err) {
      alert('Email/password sign-in failed. Please try again.');
      setError("Email/password sign-in failed. Please try again.")
    }
  };

  return (
    <div style={{ 
        fontFamily: "'Arial', sans-serif",
        backgroundColor: "#F4E7F7",
        // minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // maxWidth: 400, 
        margin: '50px auto', 
        // padding: "24px" 
      }}>

      <div style={{
          backgroundColor: "#3E1D84",
          color: "white",
          // padding: "2rem",
          padding: "50px",
          borderRadius: "20px",
          width: "400px",
          textAlign: "center",
          boxShadow: "3px 3px 0px #2B1463",
      }}>
        <form onSubmit={handleEmailSignIn} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
            autoComplete="off">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "1rem",
                border: "none",
                borderRadius: "6px",
                height: "60px",
              }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "1rem",
                border: "none",
                borderRadius: "6px",
                height: "60px",
            }}
          />

          <button type="submit" style={{
              width: "100%",
              backgroundColor: "#B99DD0",
              color: "white",
              padding: "0.6rem",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "2px 2px 0px #2B1463",
              marginBottom: "1rem",
              height: "60px",
            }}>
              Sign in with Email
            </button>
        </form>
        {signSucceeded && <p style={{ color: 'green' }}>{signSucceeded}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{marginBottom: "1rem"}}>or</div>
        {/* Google login */}
        <GoogleSignInUp />
      </div>
    </div>
  );
}
