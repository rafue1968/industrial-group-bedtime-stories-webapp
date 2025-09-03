'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation';

export default function ShowLogIn() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed!');
    }
  };

  if (!user) return null;

  return (
    <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ecf0f1',
        padding: '10px 15px',
        borderRadius: '10px',
        fontSize: '14px',
        display: 'inline-block'
    }}>
      ✅ Logged in as <strong>{user.email}</strong>
      <button
        onClick={handleLogout}
        style={{
          marginLeft: 10,
          padding: '3px 10px',
          borderRadius: '6px',
          border: 'none',
          background: '#e74c3c',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Logout
      </button>
    </div>
  );
}