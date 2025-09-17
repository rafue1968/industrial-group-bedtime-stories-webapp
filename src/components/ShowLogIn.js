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
      router.push('/login');
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
      alert('Logout failed!');
    }
  };

  if (!user) return null;

  return (
    <div className='showLoginBox'>
      ✅ Logged in as <strong>{user.displayName || user.email}</strong>
      <button
        onClick={handleLogout}
        className='logoutButton'
      >
        Logout
      </button>
    </div>
  );
}