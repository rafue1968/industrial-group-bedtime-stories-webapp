"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { firestore } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Loading from "./Loading";

export default function SavedStoriesList({ userId }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    const storiesRef = collection(firestore, `users/${userId}/savedStories`);
    const q = query(storiesRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setStories(rows);
        setLoading(false);
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  const onDeleteStory = async (userId, storyId) => {
    if (!userId || !storyId) return;
    if (!confirm("Delete this story from your library?")) return;
    try {
      const ref = doc(firestore, `users/${userId}/savedStories`, storyId);
      await deleteDoc(ref);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete story");
    }
  };

  const onShareStory = async (story) => {
    if (!userId || !story) return;
    setSharing((m) => ({ ...m, [story.id]: true }));
    try {
      const payload = {
        userId,
        sourceId: story.id,
        title: story.storyName || story.title || "Untitled story",
        topic: story.topic || "General",
        summaryText: story.summary || story.textPreview || "",
        storyText: story.story || story.text || "",
        lengthMinutes: story.lengthMinutes || 10,
      };

      const res = await fetch("/api/share-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = {};
      const txt = await res.text();
      try {
        data = JSON.parse(txt);
      } catch {
        data = { error: txt };
      }

      if (!res.ok) throw new Error(data.error || "Failed to share");

      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, shared: true } : s))
      );

      alert(
        data.alreadyGlobal
          ? "ℹ️ This story already exists in Community. Marked as shared in your library."
          : data.already
          ? "ℹ️ You already shared this story earlier."
          : "🎉 Shared to Community!"
      );
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to share story. Please try again.");
    } finally {
      setSharing((m) => ({ ...m, [story.id]: false }));
    }
  };

  if (loading) return <Loading loading={loading} />;

  if (!loading && stories.length === 0) {
    return (
      <div style={{ height: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="no-stories-saved-box">
          <h2>There are no stories saved. Sorry.</h2>
        </div>
      </div>
    );
  }

  return (
    <section style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 1100 }}>
        <h2 style={{ color: "#3E1D84", marginBottom: "1rem" }}>Saved Stories</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {stories.map((story) => {
            const disabledShare = !!sharing[story.id] || !!story.shared;
            const preview =
              story.story?.slice(0, 300) ||
              story.text?.slice(0, 300) ||
              story.summary ||
              "—";

            return (
              <article
                key={story.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 8px 18px rgba(62,29,132,0.15)",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 220,
                }}
              >
                <header style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <h3
                    style={{ color: "#3E1D84", margin: 0, fontSize: "1.05rem", lineHeight: 1.25, flex: 1 }}
                    title={story.storyName || story.title}
                  >
                    {story.storyName || story.title || "Untitled story"}
                  </h3>
                  {story.shared && (
                    <span
                      style={{
                        background: "#EDE1F6",
                        color: "#3E1D84",
                        fontWeight: 700,
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 999,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Shared
                    </span>
                  )}
                </header>

                {story.topic && (
                  <p style={{ margin: "4px 0 0", color: "#6B4FA3", fontWeight: 500 }}>
                    {story.topic}
                  </p>
                )}

                <p
                  style={{
                    color: "#4A3C72",
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    marginTop: 8,
                    marginBottom: "auto",
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {preview}
                  {(story.story && story.story.length > 300) ||
                  (story.text && story.text.length > 300)
                    ? "…"
                    : ""}
                </p>

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
                    disabled={disabledShare}
                    style={{
                      ...btnSecondary,
                      cursor: disabledShare ? "not-allowed" : "pointer",
                      opacity: disabledShare ? 0.85 : 1,
                    }}
                    title={
                      story.shared
                        ? "Already shared to Community"
                        : sharing[story.id]
                        ? "Sharing…"
                        : "Share to Community"
                    }
                  >
                    {story.shared ? "Shared" : sharing[story.id] ? "Sharing…" : "Share"}
                  </button>

                  <button
                    onClick={() => onDeleteStory(userId, story.id)}
                    style={btnDanger}
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
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