// src/app/api/stories/[id]/vote/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req, { params }) {
  const storyId = params.id;
  try {
    const { userId, value } = await req.json();
    if (!storyId || !userId || ![1, -1].includes(value)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const storyRef = db.collection("stories").doc(storyId);
    const voteRef = storyRef.collection("votes").doc(userId);

    await db.runTransaction(async (tx) => {
      const [storySnap, voteSnap] = await Promise.all([tx.get(storyRef), tx.get(voteRef)]);
      if (!storySnap.exists) throw new Error("Story not found");

      const prev = voteSnap.exists ? voteSnap.data().value : 0;
      if (prev === value) return;

      let likes = storySnap.data().likesCount || 0;
      let dislikes = storySnap.data().dislikesCount || 0;

      if (prev === 1) likes -= 1;
      if (prev === -1) dislikes -= 1;

      if (value === 1) likes += 1;
      if (value === -1) dislikes += 1;

      tx.set(voteRef, { value }, { merge: true });
      tx.update(storyRef, { likesCount: likes, dislikesCount: dislikes });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("vote error:", e);
    return NextResponse.json({ error: "Vote failed" }, { status: 500 });
  }
}
