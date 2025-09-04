"use client";

import { useEffect, useState } from "react";
import { firestore } from "../../lib/firebase"; // client SDK
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import Loading from "./Loading";
import { useRouter } from "next/navigation";

export default function SavedStoriesList({userId}) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Reference collection and query
    const storiesRef = collection(firestore, `users/${userId}/savedStories`);
    const q = query(storiesRef, orderBy("createdAt", "desc"));

    // Real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const storiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStories(storiesData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [userId]);


  const onDeleteStory = async (userId, storyId) => {
    if (!userId || !storyId) return;

    try {
      const docRef = doc(firestore, `users/${userId}/savedStories`, storyId);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("Error deleting story:", err);
      alert("Failed to delete story");
    }
  }

  if (loading) return <Loading loading={loading} />;
  if (!loading && stories.length === 0) return (
    <div style={{height: "40%"}}>
      <div style={{display: "flex", justifyContent: "center", marginTop: "60px"}}>
        <h2>There are no stories saved. Sorry.</h2>
      </div>
    </div>
)
  return (
    <section style={{display: "flex", justifyContent: "center"}}>
        <div className="cardLibrary">
          <h2>Saved Stories:</h2>
            <ol>
              {stories.map(story => (
                <li key={story.id}>
                  {story.storyName}  
                  <button className="readStoryButton" onClick={() => router.push(`/my-library/${story.id}`)}>Read Story</button>  
                  <button className="shareButton">Share</button>  
                  <button className="deleteButton" onClick={() => onDeleteStory(userId, story.id)}>Delete</button></li>
              ))}
            </ol>
        </div>
    </section>
  );
}
