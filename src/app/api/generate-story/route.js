// src/app/api/generate-story/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@lib/firebaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomBytes } from "crypto";

const WORDS_PER_MIN = 130;

export async function POST(req) {
  try {
    const { summaryId, summaryText, userId, lengthMinutes = 10, topic = "General", title = "" } = await req.json();

    if (!summaryId || !summaryText || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const targetWords = Math.round(lengthMinutes * WORDS_PER_MIN);

    const prompt = `
Expand the following bedtime story summary into ~${targetWords} words.
Make it soothing, cozy, and child-friendly.

SUMMARY:
${summaryText}
    `;

    const result = await model.generateContent(prompt);
    const storyText = result?.response?.text?.() || result?.response?.text || "";

    if (!storyText.trim()) {
      return NextResponse.json({ error: "Empty story text" }, { status: 502 });
    }

    const storyRef = db.collection("stories").doc();
    const shareCode = randomBytes(3).toString("hex");

    const batch = db.batch();

    // ✅ Add richer metadata for Community Page
    batch.set(storyRef, {
      userId,
      summaryId,
      text: storyText,
      summary: summaryText, // short version
      title: title || summaryText.split(" ").slice(0, 5).join(" ") + "…", // crude title fallback
      topic: topic || "General",
      textPreview: storyText.slice(0, 120) + "…", // preview for cards
      lengthMinutes,
      isPublic: true, // 👈 important so Community picks it up
      createdAt: new Date(),
      likesCount: 0,
      dislikesCount: 0,
      shareCode,
    });

    // Link story to user summary
    const summaryRef = db
      .collection("users")
      .doc(userId)
      .collection("summaries")
      .doc(summaryId);
    batch.update(summaryRef, { storyId: storyRef.id });

    await batch.commit();

    return NextResponse.json(
      { storyId: storyRef.id, text: storyText, shareUrl: `/story/${storyRef.id}` },
      { status: 200 }
    );
  } catch (e) {
    console.error("generate-story error:", e);
    return NextResponse.json({ error: "Story generation failed" }, { status: 500 });
  }
}