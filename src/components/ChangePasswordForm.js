"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import { updatePassword } from "firebase/auth";

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const user = auth.currentUser;
    if (!user) {
      setMessage("⚠️ No user is logged in.");
      setLoading(false);
      return;
    }

    try {
      await updatePassword(user, newPassword);
      setMessage("✅ Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.error("Error updating password:", err);
      if (err.code === "auth/requires-recent-login") {
        setMessage("❌ Please log in again before changing your password.");
      } else {
        setMessage("❌ Error: " + err.message);
      }
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleChangePassword}
      style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#f9f9f9",
        maxWidth: "400px",
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: "#3E1D84" }}>Change Password</h3>

      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "0.6rem",
          marginBottom: "1rem",
          border: "1px solid #ccc",
          borderRadius: "6px",
        }}
      />

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          background: "#3E1D84",
          color: "white",
          padding: "0.6rem",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </form>
  );
}
