"use client";

import { useEffect, useState } from "react";
import { firestore } from "../../lib/firebase"; // client SDK
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Loading from "./Loading";
import { useRouter } from "next/navigation";

export default function SavedStoriesList({ userId }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState({}); // { [storyId]: boolean }
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const storiesRef = collection(firestore, `users/${userId}/savedStories`);
    const q = query(storiesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const storiesData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setStories(storiesData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const onDeleteStory = async (userId, storyId) => {
    if (!userId || !storyId) return;
    if (!confirm("Delete this story from your library?")) return;

    try {
      const docRef = doc(firestore, `users/${userId}/savedStories`, storyId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting story:", err);
      alert("Failed to delete story");
    }
  };

  const onShareStory = async (story) => {
    if (!userId || !story) return;
    setSharing((s) => ({ ...s, [story.id]: true }));
    try {
      const res = await fetch("/api/share-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: story.storyName || "Untitled story",
          topic: story.topic || "General",
          summaryText: story.summary || "",
          storyText: story.story,
          lengthMinutes: story.lengthMinutes || 10,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Failed to share");

      alert("🎉 Shared to Community!");
      // router.push("/community"); // optional redirect
    } catch (err) {
      console.error(err);
      alert("Failed to share story. Please try again.");
    } finally {
      setSharing((s) => ({ ...s, [story.id]: false }));
    }
  };

  if (loading) return <Loading loading={loading} />;
  if (!loading && stories.length === 0)
    return (
      <div style={{ height: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="no-stories-saved-box">
          <h2>There are no stories saved. Sorry.</h2>
        </div>
      </div>
    );

  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <h2 style={{ color: "#3E1D84", marginBottom: "1rem" }}>Saved Stories</h2>

        {/* Responsive, aligned grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {stories.map((story) => (
            <article
              key={story.id}
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 8px 18px rgba(62,29,132,0.15)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                minHeight: 220, // ensures equal card heights
              }}
            >
              <header style={{ marginBottom: 8 }}>
                <h3
                  style={{
                    color: "#3E1D84",
                    margin: 0,
                    fontSize: "1.05rem",
                    lineHeight: 1.25,
                  }}
                  title={story.storyName}
                >
                  {story.storyName || "Untitled story"}
                </h3>
                {story.topic && (
                  <p style={{ margin: "4px 0 0", color: "#6B4FA3", fontWeight: 500 }}>
                    {story.topic}
                  </p>
                )}
              </header>

              {/* Preview */}
              <p
                style={{
                  color: "#4A3C72",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  marginTop: 8,
                  marginBottom: "auto", // push actions to bottom
                  whiteSpace: "pre-wrap",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {story.story?.slice(0, 300) || "—"}
                {story.story && story.story.length > 300 ? "…" : ""}
              </p>

              {/* Actions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <button
                  onClick={() => router.push(`/my-library/${story.id}`)}
                  style={btnPrimary}
                >
                  Read
                </button>

                <button
                  onClick={() => onShareStory(story)}
                  disabled={!!sharing[story.id]}
                  style={{
                    ...btnSecondary,
                    cursor: sharing[story.id] ? "not-allowed" : "pointer",
                    opacity: sharing[story.id] ? 0.85 : 1,
                  }}
                >
                  {sharing[story.id] ? "Sharing…" : "Share"}
                </button>

                <button
                  onClick={() => onDeleteStory(userId, story.id)}
                  style={btnDanger}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const btnBase = {
  border: "none",
  padding: "0.6rem 0.8rem",
  borderRadius: 10,
  fontWeight: 700,
  boxShadow: "0 2px 0 rgba(0,0,0,0.12)",
};

const btnPrimary = {
  ...btnBase,
  background: "#3E1D84",
  color: "white",
};

const btnSecondary = {
  ...btnBase,
  background: "#EDE1F6",
  color: "#3E1D84",
};

const btnDanger = {
  ...btnBase,
  background: "#FEE2E2",
  color: "#9b1c1c",
};