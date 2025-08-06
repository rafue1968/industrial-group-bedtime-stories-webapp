'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import GoogleSignInUp from './GoogleSignInUp';
import CreateUserIfNotExists from './CreateUserIfNotExist';

export default function SignUpForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirm) {
      setError('All fields are required.');
      alert(error)
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      alert(error);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await CreateUserIfNotExists(userCredential.user);
      setSuccess('Registration successful! Redirecting to login...');
      alert(`${success}`);
      setTimeout(() => router.push('/'), 1800);
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setConfirm('');
      }, 2000);
    } catch (err) {
      // setError('Registration failed: ' + err.message);
      alert("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h2>Sign Up</h2>
      {/* {success && <p style={{ color: 'green', margin: 0 }}>{success}</p>} */}
      {/* {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>} */}

      <form
        onSubmit={handleSignUp}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        autoComplete="off"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <div style={{ margin: '18px 0', textAlign: 'center' }}>or</div>
      <GoogleSignInUp mode="sign up" />
    </div>
  );
}
