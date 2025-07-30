// src/app/api/save-summary/route.js
import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin"; 

export async function POST(req) {
  try {
    const { topic, summary } = await req.json();

    const docRef = await db.collection("summaries").add({
      topic,
      summary,
      createdAt: new Date(), 
    });

    return NextResponse.json({ message: "✅ Summary saved", id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed to save summary:", error);
    return NextResponse.json({ error: "Failed to save summary" }, { status: 500 });
  }
}
