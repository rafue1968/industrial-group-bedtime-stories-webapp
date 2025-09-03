"use client";

import { useEffect, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import TopicCard from "../components/TopicCard";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Loading from "../components/Loading";
import ShowLogIn from "../components/ShowLogIn";

export default function Page() {

    const [loading, setLoading] = useState(true);

    const router = useRouter();

    // useEffect(() => {

    //     const unsubscribe = onAuthStateChanged(auth, async (user) => {
    //       if (user) {
    //         const snap = await getDoc(doc(firestore, "users", user.uid));
    //         // const role = snap.exists() ? snap.data().role : "user";
    //       } else {
    //         router.push("/");
    //       }
    //       setLoading(false);
    //     });
    //   return () => unsubscribe();
    // }, []);


    // if (loading) return <Loading />;


    return (
        <div className="container">
            <NavigationBar />
            <main className="mainContent">
                <div className="sloganContainer">
                    <p className="slogan">Welcome to Sleeping AI</p>
                </div>
                <p style={{fontSize: "20px"}}><strong>Sleep better with AI's Endless imagination</strong></p>

                <div style={{
                    marginTop: "50px",
                    marginBottom: "50px",
                    paddingTop: ""


                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "center"
                    }}>
                        <img src="./space-image.jpg" style={{
                            width: "80%",
                            height: "80%",
                            opacity: "70%",
                            borderRadius: "20px",
                            boxShadow: "black 8px 8px 5px" 
                        }} />
                    </div>

                </div>


                <div className="responsiveGrid">
                <div>
                    <p>
                    Sleeping AI lets you pick a topic, preview a story, customise the voice 
                    and length, then relax as AI brings your bedtime story to life. Share with 
                    the community or keep it private - your sleep, your way.
                    </p>

                    <div style={{
                    display: "flex", 
                    flexWrap: "wrap",
                    marginTop: "20px"
                    }}>
                    <button style={{
                        background: "#CBC3E3",
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "12px",
                        color: "#BA8E23",
                        flex: "1 1 180px",
                        fontSize: "clamp(16px, 1.5vw, 20px)",
                        cursor: "pointer"
                    }}
                    onClick={() => {
                        router.push("/login")
                    }}
                    >
                        <strong>Get Started</strong>                        
                    </button>
                    <button style={{
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "12px",
                        color: "#CBC3E3",
                        background: "rgba(4, 170, 109, 0)",
                        outline: "4px solid #BA8E23",
                        flex: "1 1 180px",
                        fontSize: "clamp(16px, 1.5vw, 20px)"
                    }}
                    >
                        <strong>Explore Stories</strong>
                    </button>
                    </div>
                </div>

                <div style={{textAlign: "center"}}>
                    <img src="/bed-icon.png" alt="bed" style={{
                        width: "80%",
                        height: "80%"
                    }} />
                </div>

                </div>



                <section className="topicSelectionSection" style={{position: "relative", marginBottom: "100px"}}>
                    <h2 className="topicPrompt">Choose a topic or provide a description:</h2>
                    <input type="text" placeholder="Enter a topic..." style={{
                        height: "45px",
                        marginBottom: "40px",
                        width: "80%",
                        padding: "15px",
                        borderRadius: "20px"
                    }} />
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
                    <button className="surpriseButton" style={{position:"absolute", top: "340px",}} onClick={() => {
                        router.push("/login")
                        }}>Surprise Me!
                    </button>
                </section>

                {/* <div className="settingsIcon">⚙️</div> */}
                
                <section>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        alignItems: "center"
                    }} >
                        <div style={{textAlign: "center"}}>
                            <img src="/hourglass.png" alt="bed" style={{
                                width: "80%",
                                height: "80%",
                                transform: "rotate(340deg)"
                            }} />
                        </div>

                        <div style={{
                            display:"grid",
                            gridTemplateRows: "auto auto auto",
                            justifyItems: "center",
                        }}>
                            <h2 style={{paddingBottom: "10px", color: "darkmagenta"}}>Ready to experience the magic?</h2>
                            <p style={{paddingBottom: "10px"}}>Start free today or sing in below:</p>
                            <button style={{
                                background: "#CBC3E3",
                                padding: "12px 20px",
                                border: "none",
                                borderRadius: "12px",
                                color: "#BA8E23",
                                fontSize: "20px",
                                cursor: "pointer"  
                            }}
                            onClick={() => {
                                router.push("/login")
                            }}
                             >
                                <strong>Sign In</strong>
                            </button>
                        </div>
                    </div>
                </section>
            </main>
            <ShowLogIn />
        </div>
    );
}
