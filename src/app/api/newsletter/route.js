export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

function getCreds() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.private_key === "string") {
        parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      }
      return parsed;
    } catch (e) {
      console.error("FIREBASE_SERVICE_ACCOUNT_JSON parse error:", e?.message);
    }
  }
  const project_id = process.env.FIREBASE_PROJECT_ID;
  const client_email = process.env.FIREBASE_CLIENT_EMAIL;
  let private_key = process.env.FIREBASE_PRIVATE_KEY;
  if (private_key) private_key = private_key.replace(/\\n/g, "\n");
  if (project_id && client_email && private_key) {
    return { project_id, client_email, private_key };
  }
  throw new Error("Service account not configured for Admin SDK.");
}
function db() {
  if (!getApps().length) initializeApp({ credential: cert(getCreds()) });
  return getFirestore();
}

// ---- Helpers ----
const isEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, source = "footer", userId = null } = body || {};
    if (!email || !isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const emailLower = String(email).trim().toLowerCase();
    const id = crypto.createHash("sha256").update(emailLower, "utf8").digest("hex").slice(0, 24);

    const firestore = db();
    const ref = firestore.collection("newsletterSubscribers").doc(id);
    const snap = await ref.get();

    if (snap.exists) {
      await ref.set(
        { updatedAt: FieldValue.serverTimestamp(), lastSource: source, userId: userId || null },
        { merge: true }
      );
      return NextResponse.json({ ok: true, already: true, message: "You’re already subscribed." }, { status: 200 });
    }

    await ref.set({
      email: emailLower,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      source,
      userId: userId || null,
    });

    return NextResponse.json({ ok: true, message: "Subscribed" }, { status: 200 });
  } catch (err) {
    console.error("newsletter error:", err);
    return NextResponse.json({ error: "Server error subscribing." }, { status: 500 });
  }
}