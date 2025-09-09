"use client";

import { useState } from "react";
import { auth } from "../../../lib/firebase";

export default function ContactPage() {
  const [status, setStatus] = useState({ ok: null, msg: "" });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
  e.preventDefault();
  setStatus({ ok: null, msg: "" });

  const form = e.currentTarget;

  const fd = new FormData(form);
  const payload = {
    name: fd.get("name")?.toString().trim(),
    email: fd.get("email")?.toString().trim(),
    message: fd.get("message")?.toString().trim(),
    userId: auth?.currentUser?.uid || null,
  };

  if (!payload.name || !payload.email || !payload.message) {
    setStatus({ ok: false, msg: "Please fill in all fields." });
    return;
  }

  try {
    setBusy(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error || "Failed to send");

    setStatus({ ok: true, msg: "Thanks! Your message has been sent." });

    form?.reset();
  } catch (err) {
    console.error(err);
    setStatus({ ok: false, msg: "Sorry, something went wrong. Please try again." });
  } finally {
    setBusy(false);
  }
}

  return (
    <main
      style={{
        maxWidth: 720,
        margin: "6rem auto 3rem",
        padding: "1.5rem",
        background: "white",
        borderRadius: 12,
        boxShadow: "3px 3px 0 #3E1D84",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      <h1 style={{ color: "#3E1D84", marginBottom: "1rem" }}>Contact us</h1>
      <p style={{ marginTop: 0, marginBottom: "1rem" }}>
        Send us a message and we’ll get back to you shortly.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.8rem" }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input
            name="name"
            type="text"
            required
            style={input}
            placeholder="Your name"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            name="email"
            type="email"
            required
            style={input}
            placeholder="you@example.com"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Message</span>
          <textarea
            name="message"
            required
            rows={6}
            style={{ ...input, resize: "vertical" }}
            placeholder="How can we help?"
          />
        </label>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="submit"
            disabled={busy}
            style={{
              backgroundColor: "#3E1D84",
              color: "white",
              padding: "0.7rem 1.2rem",
              border: "none",
              borderRadius: 10,
              boxShadow: "2px 2px 0 #2B1463",
              cursor: "pointer",
            }}
          >
            {busy ? "Sending…" : "Send message"}
          </button>
          {status.msg && (
            <span
              style={{
                color: status.ok ? "#1f7a1f" : "#9b1c1c",
                fontWeight: 600,
              }}
            >
              {status.msg}
            </span>
          )}
        </div>
      </form>
    </main>
  );
}

const input = {
  border: "1px solid #3E1D84",
  borderRadius: 8,
  padding: "0.6rem 0.7rem",
  fontSize: 16,
  background: "#fff",
};
