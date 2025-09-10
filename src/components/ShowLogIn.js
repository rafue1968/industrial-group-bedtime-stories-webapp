'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, firestore } from '../../lib/firebase'
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

export default function ShowLogIn() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.uid) {
        const docRef = doc(firestore, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
        } else {
          setUser({ email: firebaseUser.email });
        }
      } else {
        setUser(null);
      }
    });
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
      ✅ Logged in as <strong>{user.displayName || user.email}</strong>
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