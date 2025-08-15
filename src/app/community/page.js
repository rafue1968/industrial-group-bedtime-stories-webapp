"use client";

// import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import Image from "next/image";
import Loading from "../../components/Loading";
import { useRouter } from "next/navigation";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import NavigationBar from "../../components/NavigationBar";

export default function Community() {
  // Redirects to login if user not logged in
  // useAuthRedirect();

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
    <>
      <NavigationBar />
      <div
        style={{
          fontFamily: "'Arial', sans-serif",
          backgroundColor: "#F4E7F7",
          minHeight: "100vh",
          paddingTop: "6rem", // spacing for header
        }}
      >
        {/* Community Portal Section */}
        <section
          style={{
            margin: "2rem auto",
            width: "85%",
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "3px 3px 0px #3E1D84",
          }}
        >
          {/* Title */}
          <h2
            style={{
              color: "#3E1D84",
              marginBottom: "1.5rem",
              backgroundColor: "#D2B6F0",
              display: "inline-block",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              boxShadow: "2px 2px 0px #3E1D84",
            }}
          >
            Community Portal
          </h2>

          {/* Genres Section */}
          <h3 style={{ color: "#3E1D84", margin: "1rem 0" }}>Genres</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "2rem",
            }}
          >
            {["Fantasy", "Time Travel", "Mystery", "Action", "Bedtime"].map(
              (genre, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "#D9D9D9",
                      margin: "0 auto",
                    }}
                  ></div>
                  <p style={{ marginTop: "0.5rem", fontWeight: "bold" }}>{genre}</p>
                </div>
              )
            )}
          </div>

          {/* Recent Stories Section */}
          <h3 style={{ color: "#3E1D84", marginBottom: "1rem" }}>
            Recent Stories
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
              background: "linear-gradient(to bottom, #B99DD0, #F4E7F7)",
              padding: "1.5rem",
              borderRadius: "12px",
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  background: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  boxShadow: "1px 1px 0px #3E1D84",
                }}
              >
                <Image
                  src={`https://placehold.co/80x80?text=Story${i}`}
                  alt={`Story ${i}`}
                  width={60}
                  height={60}
                  style={{ borderRadius: "8px" }}
                />
                <div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>Name</p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
                    <span style={{ color: "red" }}>❤️ 20</span>
                    <span style={{ color: "#3E1D84" }}>💬 10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
