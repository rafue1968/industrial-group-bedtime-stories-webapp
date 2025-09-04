"use client";
import Link from 'next/link';
// import styles from '../styles/NavigationBar.module.css';

export default function NavigationBar() {
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
        <li><Link href="my-library">Library</Link></li>
        <li><Link href="/profile">My Profile</Link></li>
      </ul>
    </nav>
  );
}
