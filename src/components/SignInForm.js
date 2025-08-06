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
      alert(signSucceeded);
      router.push("/home")

    } catch (err) {
      alert('Email/password sign-in failed. Please try again.');
    }
  };

  return (
    <div>
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
      {/* {signSucceeded && <p style={{ color: 'green' }}>{signSucceeded}</p>} */}
      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
      <div>or</div>
      {/* Google login */}
      <GoogleSignInUp />
    </div>
  );
}
