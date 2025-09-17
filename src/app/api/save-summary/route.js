import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin"; 
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { topic, userId } = await req.json();
    if (!topic || !userId) {
      return NextResponse.json({ error: "Missing topic or userId" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Write a concise, cozy bedtime story summary (100-140 words) for the topic: "${topic}". Keep tone gentle and soothing.`;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error("Gemini API error:", err);
      return NextResponse.json(
        { error: "AI service is temporarily overloaded. Please try again in a moment." },
        { status: 503 }
      );
    }

    const summaryText = result?.response?.text?.();
    if (!summaryText?.trim()) {
      return NextResponse.json({ error: "Empty summary text" }, { status: 502 });
    }

    const ref = db.collection("users").doc(userId).collection("summaries").doc();
    await ref.set({
      topic,
      text: summaryText,
      createdAt: new Date(),
      storyId: null,
    });

    return NextResponse.json({ summaryId: ref.id, summary: summaryText }, { status: 200 });
  } catch (e) {
    console.error("save-summary error:", e);
    return NextResponse.json({ error: e.message || "Failed to save summary" }, { status: 500 });
  }
}
