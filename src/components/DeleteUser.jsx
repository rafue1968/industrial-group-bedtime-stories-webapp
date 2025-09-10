"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";

export default function DeleteUserButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (!user) {
      setMessage("⚠️ No user logged in.");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to permanently delete your account? This cannot be undone."
    );
    if (!confirmDelete) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Your account was deleted successfully.");
        await auth.signOut(); // sign out from client
      } else {
        setMessage("❌ Error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete request failed:", err);
      setMessage("❌ Request failed. See console for details.");
    }

    setLoading(false);
  };

  return (
    <div style={{ marginTop: "1rem", textAlign: "center" }}>
      <button
        onClick={handleDeleteAccount}
        disabled={loading}
        style={{
          background: "#e63946",
          
        }}
      >
        {loading ? "Deleting..." : "Delete My Account"}
      </button>
      {message && <p style={{ marginTop: "0.5rem" }}>{message}</p>}
    </div>
  );
}
