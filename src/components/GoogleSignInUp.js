'use client';
import { useState } from 'react';
import { auth, provider } from '@/FirebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';//to see where you are
import CreateUserIfNotExists from './CreateUserIfNotExist';

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
      if (pathname !== '/') {//this to don t redirect if using sign in with google
        setTimeout(() => router.push('/'), 1800);
      }
    } catch (err) {
      setError(`Google ${mode} failed: ${err.message}`);
      console.error("Google sign in/up failed:", err);
    }
    setLoading(false);
  };

  return (
    <div>
      <button type="button" onClick={handleGoogleAuth} disabled={loading}>
        {loading
          ? "Please wait..."
          : mode === "sign up"
            ? "Sign up with Google"
            : "Sign in with Google"}
      </button>
      {signSucceeded && <p style={{ color: 'green' }}>{signSucceeded}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
