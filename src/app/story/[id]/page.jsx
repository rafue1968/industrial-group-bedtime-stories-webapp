"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db, auth } from "@lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StoryPage() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "stories", id));
        if (snap.exists()) setStory({ id, ...snap.data() });
        else setError("Story not found");
      } catch {
        setError("Failed to load story");
      }
    })();
  }, [id]);

  const vote = async (value) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Sign in first");
      return;
    }
    setBusy(true);
    try {
      await fetch(`/api/stories/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, value }),
      });
      const snap = await getDoc(doc(db, "stories", id));
      if (snap.exists()) setStory({ id, ...snap.data() });
    } catch {
      alert("Vote failed");
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p>{error}</p>;
  if (!story) return <p>Loading…</p>;

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: 16 }}>
      <h1>Bedtime Story</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{story.text}</p>

      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button disabled={busy} onClick={() => vote(1)}>👍 {story.likesCount}</button>
        <button disabled={busy} onClick={() => vote(-1)}>👎 {story.dislikesCount}</button>
      </div>
    </main>
  );
}
