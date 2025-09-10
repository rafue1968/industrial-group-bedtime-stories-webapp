"use client";

import { useEffect, useState } from "react";
import useCurrentUser from "@lib/useCurrentUser";
import NavigationBar from "@/components/NavigationBar";
import TopicCard from "@/components/TopicCard";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import ShowLogIn from "@/components/ShowLogIn";



export default function Page() {

   /* const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const snap = await getDoc(doc(firestore, "users", user.uid));
            // const role = snap.exists() ? snap.data().role : "user";
          } else {
            router.push("/");
          }
          setLoading(false);
        });
      return () => unsubscribe();
    }, []);


    if (loading) return <Loading />;*/
 


   /* return (
        <div className="container">
            <NavigationBar />
            <ShowLogIn />
            <main className="mainContent">
                <div className="sloganContainer">
                    <p className="slogan">“Sleep better with AI’s endless imagination”</p>
                </div>
                <section className="topicSelectionSection">
                    <h2 className="topicPrompt">Select a Topic or choose your own:</h2>
                    <div className="topicCardsWrapper">
                        <div className="arrow">&lt;</div>
                        <div className="topicCardsContainer">
                            <TopicCard title="Science" imageUrl="/images/science.png" />
                            <TopicCard title="Time Travel" imageUrl="/images/time-travel.png" />
                            <TopicCard title="Mindfulness" imageUrl="/images/mindfulness.png" />
                            <TopicCard title="Fantasy" imageUrl="/images/fantasy.png" />
                        </div>
                        <div className="arrow">&gt;</div>
                    </div>
                </section>
                <button className="surpriseButton">Surprise Me!</button>
                <div className="settingsIcon">⚙️</div>
            </main>
        </div>
    );
}/*
"use client";

import { useRouter } from "next/navigation";
import useCurrentUser from "@/lib/hooks/useCurrentUser"; // ✅ your hook
import NavigationBar from "../components/NavigationBar";
import TopicCard from "../components/TopicCard";

export default function Home() {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const handleTopicClick = (topic) => {
    if (loading) return; // still checking login

    if (!user) {
      router.push("/register"); // ✅ not logged in → go to register page
    } else {
      router.push(`/topics/${topic.toLowerCase()}`); // logged in → go to topic
    }
  };*/

   const { user, loading } = useCurrentUser();
  const router = useRouter();

  const handleTopicClick = (topic) => {
    if (loading) return; // still checking login

    if (!user) {
      router.push("/signin");
    }
  };

  return (
    
    <div className="container">
      <NavigationBar />
      <main className="mainContent">
        <div className="sloganContainer">
          <p className="slogan">“Sleep better with AI’s endless imagination”</p>
        </div>
           <ShowLogIn />
           {/* ✅ Sign In / Sign Up buttons */}
        <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
          <button
            onClick={() => router.push("/signin")}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              background: "#603885ff",
              color: "#fff",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Sign In/Sign Up
          </button>
          
        </div>

        <section className="topicSelectionSection">
          <h2 className="topicPrompt">Select a Topic or choose your own:</h2>
          <div className="topicCardsWrapper">
            <div className="arrow">&lt;</div>
            <div className="topicCardsContainer">
              <div onClick={() => handleTopicClick("Science")}>
                <TopicCard title="Science" imageUrl="/images/science.png" />
              </div>
              <div onClick={() => handleTopicClick("Time Travel")}>
                <TopicCard title="Time Travel" imageUrl="/images/time-travel.png" />
              </div>
              
              <div onClick={() => handleTopicClick("Mindfulness")}>
                <TopicCard title="Mindfulness" imageUrl="/images/mindfulness.png" />
              </div>
              <div onClick={() => handleTopicClick("Fantasy")}>
                <TopicCard title="Fantasy" imageUrl="/images/fantasy.png" />
              </div>
            </div>
            <div className="arrow">&gt;</div>
          </div>
        </section>

        <button
          className="surpriseButton"
          onClick={() => handleTopicClick("Random")}
        >
          Surprise Me!
        </button>
        <div className="settingsIcon">⚙️</div>
      </main>
    </div>
  );
}