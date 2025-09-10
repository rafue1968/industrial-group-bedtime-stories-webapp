//Location - src/components/Footer.jsx
//file name - Footer.jsx

"use client";
import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubscribe = async (e) => {
    e.preventDefault();
    setMsg("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMsg("⚠️ Please enter a valid email address.");
      return;
  }
  
  try {
      setBusy(true);
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Request failed");
      }
      setMsg("✅ Thanks! You’re subscribed.");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscribe failed:", err);
      setMsg("❌ Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <footer
      style={{
        marginTop: "3rem",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        boxShadow: "0 -2px 0 #d7d7d7",
        background:
          "radial-gradient(120% 160% at 10% 0%, #F4E7F7 0%, #CDB4E7 45%, #9D8FC2 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "1.75rem 1rem 2rem",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1.4fr",
          gap: "1.25rem",
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.25rem",
              color: "#1d133f",
              letterSpacing: 0.2,
            }}
          >
            Sleeping AI
          </div>
        </div>

        {/* Details */}
        <nav aria-label="Footer – Details">
          <h4 style={headingStyle}>Details</h4>
          <ul style={listStyle}>
            <li><Link href="/" style={linkStyle}>Home</Link></li>
            <li><Link href="/generate" style={linkStyle}>Generate</Link></li>
            <li><Link href="/community" style={linkStyle}>Community</Link></li>
            <li><Link href="/my-library" style={linkStyle}>Library</Link></li>
            <li><Link href="/profile" style={linkStyle}>Profile</Link></li>
          </ul>
        </nav>

        {/* Contact */}
        <nav aria-label="Footer – Contact">
          <h4 style={headingStyle}>Contact</h4>
          <ul style={listStyle}>
            <li><Link href="/contact" style={linkStyle}>Contact Us</Link></li>
            <li><a href="mailto:hello@sleepingai.com">Email</a></li>
            <li><Link href="https://www.linkedin.com" target="_blank" rel="noopener" style={linkStyle}>LinkedIn</Link></li>
            <li><Link href="https://www.instagram.com" target="_blank" rel="noopener" style={linkStyle}>Instagram</Link></li>
            <li><Link href="https://twitter.com" target="_blank" rel="noopener" style={linkStyle}>Twitter</Link></li>
          </ul>
        </nav>

        {/* Newsletter */}
        <div>
          <h4 style={headingStyle}>Join our newsletter</h4>
          <form
            onSubmit={onSubscribe}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              background: "#563f99",
              borderRadius: 999,
              padding: 6,
              boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.1)",
              maxWidth: 460,
            }}
          >
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              aria-label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                borderRadius: "20px",
                color: "rgba(255,255,255,0.9)",
                padding: "0.7rem 1rem",
                fontSize: 16,
                fontStyle: "italic",
              }}
            />
            <button
              type="submit"
              disabled={busy}
              style={{
                background: "#98A66C",
                color: "#1d133f",
                fontWeight: 700,
                border: "none",
                borderRadius: 999,
                padding: "0.6rem 1.1rem",
                marginLeft: 6,
                minWidth: 92,
                cursor: busy ? "not-allowed" : "pointer",
                boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
                opacity: busy ? 0.8 : 1,
              }}
            >
              {busy ? "Submitting…" : "Submit"}
            </button>
          </form>
          {msg && (
            <p
              role="status"
              style={{
                marginTop: 8,
                fontWeight: 600,
                color: msg.startsWith("✅")
                  ? "#1f7a1f"
                  : msg.startsWith("⚠️")
                  ? "#734400"
                  : "#9b1c1c",
              }}
            >
              {msg}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

const headingStyle = {
  margin: "0 0 0.5rem 0",
  color: "#1d133f",
  fontWeight: 700,
};

const listStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: 6,
};

const linkStyle = {
  color: "#1d133f",
  textDecoration: "none",
};
