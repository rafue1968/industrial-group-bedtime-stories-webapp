import { db } from "./firebaseAdmin";
import { collection, addDoc, serverTimestamp } from "firebase-admin/firestore";

export async function saveSummaryToFirestore(topic, summaryText) {
  try {
    const summariesCollection = collection(db, "summaries");
    await addDoc(summariesCollection, {
      topic,
      summary: summaryText,
      createdAt: serverTimestamp(),
    });
    console.log("Summary saved via Admin SDK");
  } catch (error) {
    console.error("Admin SDK failed to save summary:", error);
  }
}
