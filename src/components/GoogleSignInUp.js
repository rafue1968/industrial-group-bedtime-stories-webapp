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
      if (pathname !== '/') {
        setTimeout(() => router.push('/'), 1800);
      }
    } catch (err) {
      setError(`Google ${mode} failed: ${err.message}`);
      console.error("Google sign in/up failed:", err);
    }
    setLoading(false);
  };

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {/* Divider with line and 'or' in the middle - consistent with Register */}
      <div style={{
        display: "flex",
        alignItems: "center",
        margin: "1.2rem 0", // tightened spacing
        color: "#888"
      }}>
        <span style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}></span>
        <span style={{ margin: "0 0.8rem", fontSize: "0.9rem" }}>or</span>
        <span style={{ flex: 1, height: "1px", backgroundColor: "#ccc" }}></span>
      </div>

      {/* Google Auth Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        style={{
          width: "100%",
          backgroundColor: "white",
          color: "#555",
          padding: "0.8rem 1rem",
          border: "1px solid #ccc",
          borderRadius: "30px",
          fontWeight: "500",
          fontSize: "1rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          transition: "background 0.2s ease-in-out",
          height: "46px",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f7f7f7")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
      >
        <Image
          width={20}
          height={20}
          src="/google-logo.png"
          alt="google-logo"
        />
        <span>
          {loading
            ? "Please wait..."
            : mode === "sign up"
              ? "Sign up with Google"
              : "Sign in with Google"}
        </span>
      </button>

      {/* Alerts */}
      {signSucceeded && alert(`${signSucceeded}`)}
      {error && alert(`${error}`)}
    </div>
  );
}