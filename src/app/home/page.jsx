"use client";

import { useEffect, useState } from "react";
import NavigationBar from "../../components/NavigationBar";
import TopicCard from "../../components/TopicCard";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import ShowLogIn from "../../components/ShowLogIn";

export default function Page() {

    const [loading, setLoading] = useState(true);

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


    if (loading) return <Loading />;


    return (
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
}