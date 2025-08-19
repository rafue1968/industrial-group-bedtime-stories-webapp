"use client";

import AIGenerator from "../../components/AIGenerator";
import NavigationBar from "../../components/NavigationBar";
import styles from '../styles/NavigationBar.module.css';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Loading from "../../components/Loading";
import { auth, db } from "../../../lib/firebase";
import ShowLogIn from "../../components/ShowLogIn";

export default function Page() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
    
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
              if (user) {
                const snap = await getDoc(doc(db, "users", user.uid));
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
        <div>
            <NavigationBar />
            <AIGenerator />
            <ShowLogIn />
        </div>


        
    )
}