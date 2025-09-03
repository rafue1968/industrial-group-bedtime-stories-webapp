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

    // ✅ Validation
    if (!email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await CreateUserIfNotExists(cred.user);

      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => router.push('/home'), 1000);

      setEmail('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      let message = 'Registration failed. Please try again.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (err?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password is too weak. Choose a stronger one.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      {/* Inline Error/Success Messages */}
      {error && <p style={{ color: '#D6336C', margin: "0 0 1rem" }}>{error}</p>}
      {success && <p style={{ color: '#2E7D32', margin: "0 0 1rem" }}>{success}</p>}

      <form 
        onSubmit={handleSignUp} 
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }} 
        autoComplete="off"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={{
            width:"100%", padding:"0.9rem 1.2rem",
            border:"1.5px solid #B99DD0", borderRadius:"25px",
            outline:"none", fontSize:"1rem",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3E1D84")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#B99DD0")}
        />

        <input
          type="password"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          style={{
            width:"100%", padding:"0.9rem 1.2rem",
            border:"1.5px solid #B99DD0", borderRadius:"25px",
            outline:"none", fontSize:"1rem",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3E1D84")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#B99DD0")}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          style={{
            width:"100%", padding:"0.9rem 1.2rem",
            border:"1.5px solid #B99DD0", borderRadius:"25px",
            outline:"none", fontSize:"1rem",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3E1D84")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#B99DD0")}
        />

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={loading}
          style={{ 
            width:"100%", padding:"0.9rem",
            backgroundColor: loading ? "#A088CA" : "#3E1D84",
            color:"white",
            border:"none", borderRadius:"25px",
            fontWeight:"bold", fontSize:"1rem",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow:"2px 2px 0px #B99DD0",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = "#5A32A8")}
          onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = "#3E1D84")}
        >
          {loading ? 'Signing up...' : 'Create Account'}
        </button>
      </form>

      {/* Google Sign Up (divider built-in for consistency) */}
      <GoogleSignInUp mode="sign up" />
    </div>
  );
}