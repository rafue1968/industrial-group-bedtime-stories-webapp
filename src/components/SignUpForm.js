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
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState('')


  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !phoneNumber || !email || !password || !confirm) {
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
      await CreateUserIfNotExists({
        ...userCredential.user,
        displayName: fullName,
        phoneNumber: phoneNumber
      });
      setSuccess('Registration successful! Redirecting to Community Portal...');
      setTimeout(() => router.push('/community'), 1800);
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setFullName('')
        setPhoneNumber('')

        setConfirm('');
      }, 2000);
    } catch (err) {
      setError('Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      marginBottom: 0,
      }}>

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
          {success && <p style={{ color: 'green', margin: 0 }}>{success}</p>}
          {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}

          <form
            onSubmit={handleSignUp}
            style={{
              gap: 16,
            }}
            autoComplete="off"
          >

            <input 
              type='text'
              placeholder='Enter your Full Name'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete='name'
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
              type='text'
              placeholder='Enter your Phone Number'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
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
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="username"
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
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "0.6rem",
                marginBottom: "1rem",
                border: "none",
                borderRadius: "6px",
                height: "60px",
              }}/>

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              maxLength={16}
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "none",
                borderRadius: "6px",
                marginBottom: "1rem",
                height: "60px",
            }}

            />
            <button type="submit" disabled={loading} style={{
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
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>

          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>or</div>
          <GoogleSignInUp mode="sign up" />

      </div>
    </div>
  );
}