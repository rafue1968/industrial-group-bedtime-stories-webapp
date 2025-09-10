"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore, auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import NavigationBar from "../../components/NavigationBar";

export default function CommunityPage() {
  const router = useRouter();

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [user, setUser] = useState(null);
  const [likes, setLikes] = useState({});
  const [saves, setSaves] = useState({});
  const [expandedStory, setExpandedStory] = useState(null);
  const [authors, setAuthors] = useState({}); // {userId: displayName}

  // Keep track of inner Firestore listener cleanup functions
  const innerUnsubsRef = useRef([]);

  const genreIcons = {
    All: "/genres/all.png",
    "Time Travel": "/genres/time-travel.png",
    Fantasy: "/genres/fantasy.png",
    "Sci-Fi": "/genres/sci-fi.png",
    Mindfulness: "/genres/mindfulness.png",
    Adventure: "/genres/adventure.png",
    Other: "/genres/other.png",
    default: "/genres/other.png",
  };

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Public stories + likes/saves live subscriptions with proper cleanup
  useEffect(() => {
    const q = query(
      collection(firestore, "stories"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const storyList = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setStories(storyList);

      // Prefetch author display names (once per unique userId)
      const uniqueUserIds = Array.from(
        new Set(storyList.map((s) => s.userId).filter(Boolean))
      );
      const nextAuthors = { ...authors };
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          if (nextAuthors[uid]) return;
          try {
            const uSnap = await getDoc(doc(firestore, "users", uid));
            const data = uSnap.exists() ? uSnap.data() : null;
            nextAuthors[uid] =
              data?.displayName || data?.name || data?.username || "Anonymous";
          } catch {
            nextAuthors[uid] = "Anonymous";
          }
        })
      );
      setAuthors(nextAuthors);

      // Clear previous inner listeners to avoid leaks
      innerUnsubsRef.current.forEach((u) => u && u());
      innerUnsubsRef.current = [];

      // Subscribe to likes + user saves for each visible story
      storyList.forEach((story) => {
        const likeUnsub = onSnapshot(
          collection(firestore, "stories", story.id, "likes"),
          (likeSnap) => {
            setLikes((prev) => ({
              ...prev,
              [story.id]: {
                count: likeSnap.size,
                userLiked: user
                  ? likeSnap.docs.some((d) => d.id === user.uid)
                  : false,
              },
            }));
          }
        );
        innerUnsubsRef.current.push(likeUnsub);

        if (user) {
          const saveUnsub = onSnapshot(
            doc(firestore, "users", user.uid, "savedStories", story.id),
            (saveSnap) => {
              setSaves((prev) => ({
                ...prev,
                [story.id]: saveSnap.exists(),
              }));
            }
          );
          innerUnsubsRef.current.push(saveUnsub);
        }
      });

      setLoading(false);
    });

    // On unmount or user change
    return () => {
      unsub();
      innerUnsubsRef.current.forEach((u) => u && u());
      innerUnsubsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleLike = async (e, storyId) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to like.");
    const likeRef = doc(firestore, "stories", storyId, "likes", user.uid);
    const existing = await getDoc(likeRef);
    if (existing.exists()) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { userId: user.uid, createdAt: new Date() });
    }
  };

  // Save full payload so Library can display & order by createdAt
  const toggleSave = async (e, storyId) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to save.");

    const saveRef = doc(firestore, "users", user.uid, "savedStories", storyId);
    const existing = await getDoc(saveRef);

    if (existing.exists()) {
      await deleteDoc(saveRef);
      return;
    }

    // Get the full story payload from current list
    const s = stories.find((x) => x.id === storyId);
    if (!s) {
      alert("Story not found.");
      return;
    }

    await setDoc(saveRef, {
      storyId,
      storyName: s.title || s.topic || "Untitled story",
      story: s.text || s.story || "",
      topic: s.topic || "General",
      summary: s.summary || null,
      lengthMinutes: Number(s.lengthMinutes) || 5,

      // timestamps for ordering / UI
      createdAt: serverTimestamp(),
      savedAt: serverTimestamp(),

      // provenance
      source: "community",
      sourceStoryDoc: storyId,
      isPublic: !!s.isPublic,
    });
  };

  // Ensure in-library then open reader page (/my-library/[id]) reusing Library's read flow
  const readStory = async (e, story) => {
    e?.stopPropagation?.();
    if (!user) {
      alert("Please log in to read the full story.");
      router.push("/login");
      return;
    }

    // make sure it's in the user's library; if not, save it first
    const saveRef = doc(db, "users", user.uid, "savedStories", story.id);
    const existing = await getDoc(saveRef);
    if (!existing.exists()) {
      await setDoc(saveRef, {
        storyId: story.id,
        storyName: story.title || story.topic || "Untitled story",
        story: story.text || story.story || "",
        topic: story.topic || "General",
        summary: story.summary || null,
        lengthMinutes: Number(story.lengthMinutes) || 5,
        createdAt: serverTimestamp(),
        savedAt: serverTimestamp(),
        source: "community",
        sourceStoryDoc: story.id,
        isPublic: !!story.isPublic,
      });
    }

    // Reuse the Library reader page
    router.push(`/my-library/${story.id}`);
  };

  const normalizeTopic = (topic) => {
    return genreIcons[topic] ? topic : "Other";
  }

  const filteredStories =
    selectedGenre === "All"
      ? stories
      : stories.filter((s) => normalizeTopic(s.topic) === selectedGenre);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #EDE1F6, #B99DD0, #F4E7F7)",
        }}
      >
        <h2 style={{ color: "#3E1D84" }}>Loading stories...</h2>
      </div>
    );
  }

  return (
    <>
      <main
        style={{
          fontFamily: "'Poppins', sans-serif",
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, #EDE1F6, #B99DD0, #F4E7F7)",
          padding: "2rem 1rem",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#3E1D84",
            fontSize: "2.5rem",
            marginBottom: "2rem",
          }}
        >
          Welcome to the Community Portal
        </h1>

        {/* Popular Genres */}
        <section style={{ marginBottom: "4rem", textAlign: "center" }}>
          <h2 style={{ color: "#3E1D84", marginBottom: "1.5rem" }}>
            Popular Genres
          </h2>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {Object.entries(genreIcons)
              .filter(([key]) => key !== "default")
              .map(([name, icon]) => (
                <div key={name} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      background: selectedGenre === name ? "#E3D4F9" : "#EFE6FA",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "0 auto",
                      boxShadow:
                        selectedGenre === name
                          ? "0 10px 25px rgba(62,29,132,0.4)"
                          : "0 4px 10px rgba(62,29,132,0.15)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedGenre(name)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(62,29,132,0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow =
                        selectedGenre === name
                          ? "0 10px 25px rgba(62,29,132,0.4)"
                          : "0 4px 10px rgba(62,29,132,0.15)";
                    }}
                  >
                    <img src={icon} alt={name} style={{ width: "65%", height: "65%" }} />
                  </div>
                  <p
                    style={{
                      marginTop: "0.75rem",
                      color: "#3E1D84",
                      fontWeight: "500",
                    }}
                  >
                    {name}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* Stories Grid */}
        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto 4rem auto",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(244,231,247,0.9))",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 8px 24px rgba(62,29,132,0.15)",
          }}
        >
          <h2
            style={{ textAlign: "center", color: "#3E1D84", marginBottom: "2rem" }}
          >
            {selectedGenre === "All"
              ? "Recently Shared Stories"
              : `${selectedGenre} Stories`}
          </h2>

          {filteredStories.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6B4FA3" }}>
              📭 No stories yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredStories.map((story) => {
                const isExpanded = expandedStory === story.id;
                // const icon =
                //   (story.topic && `/genres/${String(story.topic).toLowerCase()}.png`) ||
                //   "/genres/fantasy.png";
                const topic = normalizeTopic(story.topic);
                const icon = genreIcons[topic] || genreIcons.default;

                return (
                  <div
                    key={story.id}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      padding: "1rem",
                      boxShadow: "0 6px 14px rgba(62,29,132,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.3s, box-shadow 0.3s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform =
                        "translateY(-6px) scale(1.02)";
                      e.currentTarget.style.boxShadow =
                        "0px 12px 22px rgba(62,29,132,0.25)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 14px rgba(62,29,132,0.25)";
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "#EFE6FA",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "0 auto 1rem auto",
                        boxShadow: "0 4px 10px rgba(62,29,132,0.15)",
                      }}
                    >
                      <img
                        src={icon}
                        alt={story.topic}
                        style={{ width: "60%", height: "60%" }}
                      />
                    </div>

                    <h3 style={{ color: "#3E1D84" }}>{story.title}</h3>
                    <p style={{ color: "#6B4FA3", fontWeight: "500" }}>
                      {story.topic}
                    </p>

                    {isExpanded && (
                      <div
                        style={{
                          background: "#F9F7FC",
                          borderRadius: "8px",
                          padding: "0.7rem",
                          marginBottom: "0.7rem",
                          fontSize: "0.9rem",
                          color: "#4A3C72",
                        }}
                      >
                        {/* NEW: shared by */}
                        <p style={{ margin: "0 0 6px" }}>
                          <strong>Shared by:</strong>{" "}
                          {story.userId ? authors[story.userId] || "Anonymous" : "Anonymous"}
                        </p>

                        <p style={{ margin: "6px 0" }}>
                          {story.textPreview ||
                            (story.summary
                              ? story.summary.slice(0, 160) + "…"
                              : "—")}
                        </p>
                        <p style={{ fontStyle: "italic", fontSize: "0.85rem", marginTop: 6 }}>
                          ⏳ {story.lengthMinutes || 5} min read
                        </p>

                        {/* NEW: Read Story using Library reader */}
                        <div style={{ marginTop: 10 }}>
                          <button
                            onClick={(e) => readStory(e, story)}
                            style={{
                              border: "none",
                              background: "#3E1D84",
                              color: "#fff",
                              padding: "8px 12px",
                              borderRadius: 10,
                              fontWeight: 700,
                              cursor: "pointer",
                              boxShadow: "0 2px 0 rgba(0,0,0,0.12)",
                            }}
                          >
                            Read Story
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() =>
                        setExpandedStory(isExpanded ? null : story.id)
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#3E1D84",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        marginBottom: "0.5rem",
                        alignSelf: "flex-start",
                      }}
                    >
                      {isExpanded ? "▲ Hide details" : "▼ More details"}
                    </button>

                    <div
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={(e) => toggleLike(e, story.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: likes[story.id]?.userLiked ? "#E63946" : "#888",
                          fontWeight: "600",
                          fontSize: "0.9rem",
                        }}
                      >
                        ❤️ {likes[story.id]?.count || 0}
                      </button>

                      <button
                        onClick={(e) => toggleSave(e, story.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: saves[story.id] ? "#3E1D84" : "#888",
                          fontWeight: "600",
                          fontSize: "0.9rem",
                        }}
                      >
                        {saves[story.id] ? "🔖 Saved" : "🔖 Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}