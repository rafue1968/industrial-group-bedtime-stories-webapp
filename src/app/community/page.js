"use client";

import { useEffect, useState } from "react";
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
  addDoc,
} from "firebase/firestore";
// ✅ FIXED: import db correctly from firebase.js
import { db, auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import NavigationBar from "../../components/NavigationBar";

export default function CommunityPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [user, setUser] = useState(null);
  const [likes, setLikes] = useState({});
  const [saves, setSaves] = useState({});
  const [expandedStory, setExpandedStory] = useState(null);

  // ✅ Newsletter state
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const genreIcons = {
    All: "/genres/all.png",
    "Time Travel": "/genres/time-travel.png",
    Fantasy: "/genres/fantasy.png",
    "Sci-Fi": "/genres/sci-fi.png",
    Mindfulness: "/genres/mindfulness.png",
    Adventure: "/genres/adventure.png",
    default: "/genres/fantasy.png",
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "stories"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const storyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStories(storyList);

      storyList.forEach((story) => {
        onSnapshot(collection(db, "stories", story.id, "likes"), (likeSnap) => {
          setLikes((prev) => ({
            ...prev,
            [story.id]: {
              count: likeSnap.size,
              userLiked: user
                ? likeSnap.docs.some((d) => d.id === user.uid)
                : false,
            },
          }));
        });

        if (user) {
          onSnapshot(
            doc(db, "users", user.uid, "savedStories", story.id),
            (saveSnap) => {
              setSaves((prev) => ({
                ...prev,
                [story.id]: saveSnap.exists(),
              }));
            }
          );
        }
      });
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const toggleLike = async (e, storyId) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to like.");

    const likeRef = doc(db, "stories", storyId, "likes", user.uid);
    const existing = await getDoc(likeRef);

    if (existing.exists()) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { userId: user.uid, createdAt: new Date() });
    }
  };

  const toggleSave = async (e, storyId) => {
    e.stopPropagation();
    if (!user) return alert("Please log in to save.");

    const saveRef = doc(db, "users", user.uid, "savedStories", storyId);
    const existing = await getDoc(saveRef);

    if (existing.exists()) {
      await deleteDoc(saveRef);
    } else {
      await setDoc(saveRef, { storyId, savedAt: new Date() });
    }
  };

  // ✅ Newsletter handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setNewsletterMessage("⚠️ Please enter a valid email.");
      return;
    }

    try {
      await addDoc(collection(db, "newsletterSubscribers"), {
        email,
        createdAt: new Date(),
      });

      setNewsletterMessage("✅ Thanks for subscribing!");
      setEmail("");
    } catch (error) {
      console.error("Error saving email:", error);
      setNewsletterMessage("❌ Failed to subscribe. Please try again.");
    }
  };

  const filteredStories =
    selectedGenre === "All"
      ? stories
      : stories.filter((s) => s.topic === selectedGenre);

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
      <NavigationBar />
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

        {/* ✅ Genre Icons */}
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
                  <p style={{ marginTop: "0.75rem", color: "#3E1D84", fontWeight: "500" }}>
                    {name}
                  </p>
                </div>
              ))}
          </div>
        </section>

        {/* ✅ Stories */}
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
          <h2 style={{ textAlign: "center", color: "#3E1D84", marginBottom: "2rem" }}>
            {selectedGenre === "All" ? "Recently Shared Stories" : `${selectedGenre} Stories`}
          </h2>

          {filteredStories.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6B4FA3" }}>📭 No stories yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredStories.map((story) => {
                const icon = genreIcons[story.topic] || genreIcons.default;
                const isExpanded = expandedStory === story.id;

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
                      e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
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
                      <img src={icon} alt={story.topic} style={{ width: "60%", height: "60%" }} />
                    </div>

                    <h3 style={{ color: "#3E1D84" }}>{story.title}</h3>
                    <p style={{ color: "#6B4FA3", fontWeight: "500" }}>{story.topic}</p>

                    {isExpanded && (
                      <div
                        style={{
                          background: "#F9F7FC",
                          borderRadius: "8px",
                          padding: "0.7rem",
                          marginBottom: "0.7rem",
                          fontSize: "0.85rem",
                          color: "#4A3C72",
                        }}
                      >
                        <p>{story.textPreview || story.summary?.slice(0, 120) + "…"}</p>
                        <p style={{ fontStyle: "italic", fontSize: "0.8rem" }}>
                          ⏳ {story.lengthMinutes || 5} min read
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedStory(isExpanded ? null : story.id)}
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

        {/* ✅ Footer with Newsletter */}
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            padding: "2rem",
            borderTop: "1px solid rgba(62,29,132,0.1)",
            color: "#3E1D84",
          }}
        >
          <div>
            <h3>Sleeping AI</h3>
          </div>
          <div>
            <h4>Details</h4>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/generate">Generate</a></li>
              <li><a href="/community">Community Portal</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@sleepingai.com">Email</a></li>
              <li><a href="https://linkedin.com" target="_blank">LinkedIn</a></li>
              <li><a href="https://instagram.com" target="_blank">Instagram</a></li>
              <li><a href="https://twitter.com" target="_blank">Twitter</a></li>
            </ul>
          </div>
          <div>
            <h4>Join our newsletter</h4>
            <form
              onSubmit={handleNewsletterSubmit}
              style={{ display: "flex", marginTop: "0.5rem" }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                style={{
                  padding: "0.5rem",
                  borderRadius: "20px 0 0 20px",
                  border: "1px solid #ccc",
                  minWidth: "180px",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#3E1D84",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "0 20px 20px 0",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </form>
            {newsletterMessage && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                {newsletterMessage}
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}