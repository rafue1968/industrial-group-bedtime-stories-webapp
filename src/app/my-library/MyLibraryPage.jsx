"use client";

import Loading from "../../components/Loading";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { firestore, auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import SavedStoriesList from "@/components/SavedStoriesList";


export default function MyLibraryPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [userId, setUserId] = useState("");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
            await getDoc(doc(firestore, "users", user.uid));
            setUserId(user.uid);
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