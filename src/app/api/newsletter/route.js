
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";


const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!getApps().length) {
  if (!raw) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_JSON env var for Admin SDK. " +
        "Set it to the full JSON (stringified)."
    );
  }
  const serviceAccount = JSON.parse(raw);
  initializeApp({ credential: cert(serviceAccount) });
}

const adminDb = getFirestore();

export async function POST(req) {
  try {
    const { email } = await req.json();

    // Basic validation
    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Write to Firestore with server timestamp
    await adminDb.collection("newsletterSubscribers").add({
      email: email.toLowerCase(),
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Newsletter subscribe failed:", err);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}