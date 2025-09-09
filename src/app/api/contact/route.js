export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "../../../../lib/firebaseAdmin"; 

export async function POST(req) {
  try {
    const { name, email, message, userId } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const docRef = db.collection("contactMessages").doc();
    await docRef.set({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      userId: userId || null,
      userAgent: req.headers.get("user-agent") || null,
      createdAt: new Date(),
      status: "new",
    });

    return NextResponse.json({ ok: true, id: docRef.id }, { status: 200 });
  } catch (err) {
    console.error("contact route error:", err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}
