"use client";

import Loading from "../../components/Loading";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { firestore, auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import NavigationBar from "@/components/NavigationBar";
import SavedStoriesList from "@/components/SavedStoriesList";


export default function Page() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
            const snap = await getDoc(doc(firestore, "users", user.uid));
            setUserId(user.uid);
            // const role = snap.exists() ? snap.data().role : "user";
            } else {
            router.push("/");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    if (loading) return <Loading loading={loading} />;
    if (!userId) {
        router.push("/");
        return null;
    }

    return (
        <>
            <SavedStoriesList userId={userId} />
        </>
    )
        

}