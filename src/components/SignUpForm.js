'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import GoogleSignInUp from './GoogleSignInUp';
import CreateUserIfNotExists from './CreateUserIfNotExist';
import Link from 'next/link';

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
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await CreateUserIfNotExists(cred.user);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => router.push('/'), 1500);
      setEmail(''); setPassword(''); setConfirm('');
    } catch (err) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{
        backgroundColor: "#3E1D84",
        color: "white",
        padding:"50px",
        borderRadius: "20px",
        width: "500px",
        textAlign: "center",
        boxShadow: "3px 3px 0px #2B1463",
      }}>
        <h2 style={{ marginBottom: "1.5rem", fontWeight: "bold" }}>Sign Up</h2>

        {/* Show messages in the UI, not alerts */}
        {error && <p style={{ color: '#ffb4b4', margin: 0 }}>{error}</p>}
        {success && <p style={{ color: '#b4ffcf', margin: 0 }}>{success}</p>}

        <form onSubmit={handleSignUp} style={{ gap: 16 }} autoComplete="off">
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="username"
            style={{ width:"100%", padding:"0.6rem", marginBottom:"1rem", border:"none", borderRadius:"6px", height:"60px" }} />

          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required autoComplete="new-password"
            style={{ width:"100%", padding:"0.6rem", marginBottom:"1rem", border:"none", borderRadius:"6px", height:"60px" }} />

          <input type="password" placeholder="Confirm Password" value={confirm}
            onChange={e => setConfirm(e.target.value)} required autoComplete="new-password"
            style={{ width:"100%", padding:"0.6rem", marginBottom:"1rem", border:"none", borderRadius:"6px", height:"60px" }} />

          <button type="submit" disabled={loading}
            style={{ width:"100%", backgroundColor:"#B99DD0", color:"white", padding:"0.6rem",
                     border:"none", borderRadius:"6px", fontWeight:"bold", cursor:"pointer",
                     boxShadow:"2px 2px 0px #2B1463", marginBottom:"1rem", height:"60px" }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>or</div>
        <GoogleSignInUp mode="sign up" />
      </div>
    </div>
  );
}
