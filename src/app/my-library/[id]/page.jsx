"use client";

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore, auth } from "../../../../lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "@/components/Loading";
import TTSPlayer from "@/components/TTSPlayer";
import NavigationBar from "@/components/NavigationBar";

export default function Page() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  // length chosen only when making full story
  const [length, setLength] = useState(10); // 5 | 10 | 20

  // audio controls only AFTER full story
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
  }, [id, userId]);

  if (loading) return <Loading loading={loading} />;
  if (!story) return <p>Story not found</p>;

  return (
    <div>
        <NavigationBar />
        <div style={{display: "flex",justifyContent: "center", margin: "70px 0px"}}>
            <div style={{
                backgroundColor: "#D2B6F0",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "3px 3px 0px #3E1D84",
                textAlign: "center",
                width: "90%",
                maxWidth: 960,
            }}>
                <div
                style={{
                    marginTop: "1rem",
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "10px",
                    boxShadow: "1px 1px 0px #3E1D84",
                    textAlign: "left",
                    position: "relative"
                }}
                >
                <h3 style={{ color: "#3E1D84", marginBottom: "0.5rem" }}>{story.storyName}</h3>
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

                <TTSPlayer
                    text={story.story}
                    voice={voice}
                    speed={speed}
                    pitch={pitch}
                />

                <div style={{display: "flex", marginTop: "20px", marginBottom: 0, justifyContent: "end"}}>
                    <button style={{margin: "10px", backgroundColor: "#3E1D84", color: "white", padding: "15px 30px", borderRadius: "20px", border: 0, boxShadow: "0 3px 5px rgba(218, 165, 32, 0.7)", width: "150px", cursor: "pointer"}} onClick={() => router.push("/my-library")}><strong>Return to Library</strong></button>
                    <button style={{margin: "10px", backgroundColor: "#3E1D84", color: "white", padding: "15px 30px", borderRadius: "20px", border: 0, boxShadow: "0 3px 5px rgba(218, 165, 32, 0.7)", width: "150px", cursor: "pointer"}}><strong>Share</strong></button>
                </div>
                </div>
            </div>
        </div>
    </div>
  );
}
