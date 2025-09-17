"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from "firebase/auth";

export default function NavigationBar() {
  
  

const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
    setCurrentUser(firebaseUser); 
  });

  return () => unsubscribeAuth();
}, []);


  return (
    <nav className="navigationBar">
      <div className="logoContainer">
        <span className="logoIcon">🌙✨</span>
        <span className="logoText">Sleeping AI</span>
      </div>
      <ul className="navLinks">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/generate">Generate</Link></li>
        <li><Link href="/community">Community</Link></li>
        <li><Link href="/my-library">Library</Link></li>
         <li>
          {currentUser ? (
            <Link href="/profile">My Profile</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}