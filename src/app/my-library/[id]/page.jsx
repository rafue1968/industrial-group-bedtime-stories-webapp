"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore, auth } from "../../../../lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "@/components/Loading";
import TTSPlayer from "@/components/TTSPlayer";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");


  const [voice, setVoice] = useState("female");
  const [speed, setSpeed] = useState("normal");
  const [pitch, setPitch] = useState("neutral"); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) setUserId(u.uid);
      else router.push("/");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!userId || !id) return;

    const fetchStory = async () => {
      try {
        const docRef = doc(firestore, `users/${userId}/savedStories`, id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setStory(snap.data());
        } else {
          console.warn("Sorry. This story does not exist.");
          router.push("/my-library");
        }
      } catch (err) {
        console.error("Error fetching story:", err);
        router.push("/my-library");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, userId, router]);

  const shareStory = async () => {
    if (!userId || !story) return;
    try {
      setShareBusy(true);
      setErrorMsg("");

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
      router.push("/community");
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to share story. Please try again.");
    } finally {
      setShareBusy(false);
    }
  };

  if (loading) return <Loading loading={loading} />;
  if (!story) return <p>Story not found</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center", margin: "70px 0px" }}>
        <div
          style={{
            backgroundColor: "#D2B6F0",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "3px 3px 0px #3E1D84",
            textAlign: "center",
            width: "90%",
            maxWidth: 960,
          }}
        >
          <div
            style={{
              marginTop: "1rem",
              backgroundColor: "white",
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "1px 1px 0px #3E1D84",
              textAlign: "left",
              position: "relative",
            }}
          >
            <h3 style={{ color: "#3E1D84", marginBottom: "0.5rem" }}>
              {story.storyName || "Saved Story"}
            </h3>

            {errorMsg && (
              <p style={{ color: "#9b1c1c", fontWeight: 600, marginTop: 0 }}>
                {errorMsg}
              </p>
            )}

            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{story.story}</p>

            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  marginTop: "1rem",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <h4 style={{ color: "#3E1D84" }}>Voice</h4>
                  <select value={voice} onChange={(e) => setVoice(e.target.value)}>
                    <option value=""></option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div>
                  <h4 style={{ color: "#3E1D84" }}>Speed</h4>
                  <select value={speed} onChange={(e) => setSpeed(e.target.value)}>
                    <option value=""></option>
                    <option value="normal">Normal</option>
                    <option value="slow">Slow</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 style={{ color: "#3E1D84" }}>Pitch</h4>
                <select value={pitch} onChange={(e) => setPitch(e.target.value)}>
                  <option value=""></option>
                  <option value="deep">Deep</option>
                  <option value="neutral">Neutral</option>
                  <option value="bright">Bright</option>
                </select>
              </div>
            </div>

            <TTSPlayer text={story.story} voice={voice} speed={speed} pitch={pitch} />

            <div
              style={{
                display: "flex",
                marginTop: "20px",
                marginBottom: 0,
                justifyContent: "end",
              }}
            >
              <button
                style={{
                  margin: "10px",
                  backgroundColor: "#3E1D84",
                  color: "white",
                  padding: "15px 30px",
                  borderRadius: "20px",
                  border: 0,
                  boxShadow: "0 3px 5px rgba(218, 165, 32, 0.7)",
                  width: "150px",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/my-library")}
              >
                <strong>Return to Library</strong>
              </button>

              <button
                style={{
                  margin: "10px",
                  backgroundColor: "#3E1D84",
                  color: "white",
                  padding: "15px 30px",
                  borderRadius: "20px",
                  border: 0,
                  boxShadow: "0 3px 5px rgba(218, 165, 32, 0.7)",
                  width: "150px",
                  cursor: shareBusy ? "not-allowed" : "pointer",
                  opacity: shareBusy ? 0.85 : 1,
                }}
                onClick={shareStory}
                disabled={shareBusy}
              >
                <strong>{shareBusy ? "Sharing…" : "Share"}</strong>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}