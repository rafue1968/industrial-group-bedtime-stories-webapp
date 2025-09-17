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
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { project_id: projectId, client_email: clientEmail, private_key: privateKey };
  }
  throw new Error(
    "Service account not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON (valid JSON with \\n) or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
  );
}
function db() {
  if (!getApps().length) initializeApp({ credential: cert(getCreds()) });
  return getFirestore();
}

function normaliseText(s = "") {
  return String(s)
    .replace(/\s+/g, " ") 
    .replace(/\u200B/g, "")
    .trim();
}
function hashText(s) {
  return crypto.createHash("sha256").update(s, "utf8").digest("hex").slice(0, 24);
}


export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      userId,
      sourceId,
      title,
      topic,
      summaryText,
      storyText,
      lengthMinutes,
    } = body || {};

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const rawText = (storyText || "").trim();
    if (!rawText) {
      return NextResponse.json({ error: "storyText is required" }, { status: 400 });
    }

    const firestore = db();

    const normalised = normaliseText(rawText);
    const contentHash = hashText(normalised);
    const preview = (summaryText && String(summaryText).slice(0, 160)) || normalised.slice(0, 160);

    let existingDoc = null;
    const byHash = await firestore.collection("stories").where("contentHash", "==", contentHash).limit(1).get();
    if (!byHash.empty) existingDoc = byHash.docs[0];

    if (!existingDoc) {
      const byPreview = await firestore.collection("stories").where("textPreview", "==", preview).limit(1).get();
      if (!byPreview.empty) existingDoc = byPreview.docs[0];
    }

    if (existingDoc) {
      if (sourceId) {
        await firestore
          .collection("users").doc(userId)
          .collection("savedStories").doc(sourceId)
          .set({ shared: true, sharedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
      return NextResponse.json(
        { ok: true, id: existingDoc.id, already: true, alreadyGlobal: true },
        { status: 200 }
      );
    }

    const postId = sourceId ? `${userId}_${sourceId}` : `${userId}_${contentHash}`;
    const postRef = firestore.collection("stories").doc(postId);
    const exists = await postRef.get();
    if (exists.exists) {
      if (sourceId) {
        await firestore
          .collection("users").doc(userId)
          .collection("savedStories").doc(sourceId)
          .set({ shared: true, sharedAt: FieldValue.serverTimestamp() }, { merge: true });
      }
      return NextResponse.json({ ok: true, id: postId, already: true }, { status: 200 });
    }

    let ownerName = "Anonymous";
    try {
      const uSnap = await firestore.collection("users").doc(userId).get();
      if (uSnap.exists) {
        const u = uSnap.data() || {};
        ownerName = u.displayName || u.name || u.email || ownerName;
      }
    } catch {}

    const docData = {
      userId,
      ownerName,
      title: (title || topic || "Untitled story").trim(),
      topic: (topic || "General").trim(),
      summary: summaryText?.trim() || null,
      text: rawText,       
      textPreview: preview,
      contentHash,         
      lengthMinutes: Number(lengthMinutes) || 5,
      isPublic: true,
      createdAt: FieldValue.serverTimestamp(),
      likesCount: 0,
      dislikesCount: 0,
      sourceId: sourceId || null,
    };

    await postRef.set(docData);

    if (sourceId) {
      await firestore
        .collection("users").doc(userId)
        .collection("savedStories").doc(sourceId)
        .set({ shared: true, sharedAt: FieldValue.serverTimestamp() }, { merge: true });
    }

    return NextResponse.json({ ok: true, id: postId }, { status: 200 });
  } catch (err) {
    console.error("share-story error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to share story" },
      { status: 500 }
    );
  }
}