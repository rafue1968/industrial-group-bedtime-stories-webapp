'use client';
import { useState } from 'react';
import { auth, provider } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import CreateUserIfNotExists from './CreateUserIfNotExist.js';
import Image from 'next/image';

export default function GoogleSignInUp({ mode = "sign in" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState('');
  const [signSucceeded, setSignSucceeded] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setError('');
    setSignSucceeded('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      await CreateUserIfNotExists(result.user);
      setSignSucceeded("Login successful!");
      if (pathname !== '/community') {
        setTimeout(() => router.push('/community'), 1800);
      }
    } catch (err) {
      setError(`Google ${mode} failed: ${err.message}`);
      console.error("Google sign in/up failed:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{
        textAlign:"center"
    }}>
      <button type="button" onClick={handleGoogleAuth} disabled={loading} style={{
              width: "100%",
              backgroundColor: "#B99DD0",
              color: "white",
              padding: "0.6rem",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              boxShadow: "2px 2px 0px #2B1463",
              height: "60px",
              cursor: "pointer"
        }}
        >
          <div style={{
            display: "flex",
            justifyContent: "center"
          }}>
              {<Image width={30} height={30} src="/google-logo.png" alt='google-logo' style={{
                alignItems: "center",
                justifyContent: "center",
              }} />}
              <p style={{
                marginTop:"8px",
                marginLeft: "20px"
              }}>{loading
                ? "Please wait..."
                : mode === "sign up"
                  ? "Sign up with Google"
                  : "Sign in with Google"
                }
                </p>
            </div>
      </button>
      {signSucceeded && <p style={{ color: 'green' }}>{signSucceeded}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}