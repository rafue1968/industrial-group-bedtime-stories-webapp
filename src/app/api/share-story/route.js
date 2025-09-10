// /app/api/share-story/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!getApps().length) {
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON env var. Paste your service account JSON into .env.local"
    );
  }
  initializeApp({ credential: cert(JSON.parse(raw)) });
}
const db = getFirestore();

export async function POST(req) {
  try {
    const {
      userId,
      title,
      topic,
      summaryText,
      storyText,
      lengthMinutes,
    } = await req.json();

    if (!userId || !storyText) {
      return NextResponse.json(
        { error: "userId and storyText are required" },
        { status: 400 }
      );
    }

    const docRef = await db.collection("stories").add({
      userId,
      title: (title || topic || "Untitled story").trim(),
      topic: (topic || "General").trim(),
      summary: summaryText?.trim() || null,
      text: storyText,
      textPreview:
        (summaryText && summaryText.slice(0, 160)) ||
        storyText.slice(0, 160),
      lengthMinutes: Number(lengthMinutes) || 5,
      isPublic: true,
      createdAt: FieldValue.serverTimestamp(),
      likesCount: 0,
      dislikesCount: 0,
    });

    return NextResponse.json({ ok: true, id: docRef.id }, { status: 200 });
  } catch (err) {
    console.error("Share story failed:", err);
    return NextResponse.json({ error: "Failed to share story" }, { status: 500 });
  }
}