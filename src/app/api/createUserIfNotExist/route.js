import { NextResponse } from "next/server";
import { db, admin } from "../../../../lib/firebaseAdmin";  

export async function POST(req) {
  try {
    const { uid, email } = await req.json();
   

    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing uid or email" },
        { status: 400 }
      );
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      await userRef.set({
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ success: true, message: "User created" });
    } else {
      return NextResponse.json({ success: true, message: "User already exists" });
    }
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
