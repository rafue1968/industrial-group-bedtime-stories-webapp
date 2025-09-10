"use client";

// import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Loading from "../../components/Loading"
import NavigationBar from "../../components/NavigationBar";


export default function Profile() {
  // ✅ Redirect to /login if user is not logged in
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
    
    
        if (loading) return <Loading loading={loading} />;


  return (
    <>
      <div
        style={{
          fontFamily: "'Arial', sans-serif",
          backgroundColor: "#F4E7F7",
          minHeight: "100vh",
          paddingTop: "6rem",
        }}
      >
        {/* Profile Section */}
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
          {/* Profile Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#D9D9D9",
              }}
            ></div>
            <div>
              <h2 style={{ margin: 0, color: "#3E1D84" }}>Name</h2>
              <p style={{ margin: 0 }}>
                Tokens: <span style={{ color: "#FFD700" }}>⭐ 20</span>
              </p>
            </div>
          </div>

          {/* Saved & Shared Stories */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginTop: "2rem",
            }}
          >
            {/* Saved Stories */}
            <div>
              <h3 style={{ color: "#3E1D84", marginBottom: "1rem" }}>
                Saved Stories:
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  background: "linear-gradient(to bottom, #B99DD0, #F4E7F7)",
                  padding: "1rem",
                  borderRadius: "12px",
                }}
              >
                {[
                  "In the forest",
                  "Adventure in Europe",
                  "Hero Adventure",
                  "Love at first sight",
                ].map((title, i) => (
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
                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                      }}
                    >
                      {title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shared Stories */}
            <div>
              <h3 style={{ color: "#3E1D84", marginBottom: "1rem" }}>
                Shared Stories:
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  background: "linear-gradient(to bottom, #B99DD0, #F4E7F7)",
                  padding: "1rem",
                  borderRadius: "12px",
                }}
              >
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      boxShadow: "1px 1px 0px #3E1D84",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        backgroundColor: "#D9D9D9",
                      }}
                    ></div>
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                      <span style={{ color: "red" }}>❤️</span>
                      <span style={{ color: "#3E1D84" }}>💬</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

