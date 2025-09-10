"use client";

import AIGenerator from "../../components/AIGenerator";
import NavigationBar from "../../components/NavigationBar";
import styles from '../styles/NavigationBar.module.css';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Loading from "../../components/Loading";
import { auth, firestore } from "../../../lib/firebase";
import ShowLogIn from "../../components/ShowLogIn";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoSurprise = searchParams.get("surprise") === "1";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Optional: fetch user doc if you need role/metadata
        try {
          await getDoc(doc(firestore, "users", user.uid));
        } catch (e) {
          console.warn("User doc fetch failed (non-blocking):", e);
        }
      } else {
        router.push("/login"); // redirect unauth users to login
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <Loading />;

  return (
    <div>
      <AIGenerator autoSurprise={autoSurprise} />
    </div>
  );
}