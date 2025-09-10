import { NextResponse } from "next/server";
import { admin, db } from "../../../../lib/firebaseAdmin";

// Handle POST request to change user email
export async function POST(req) {
  try {
    const { uid, newEmail } = await req.json();
    console.log("📩 Change Email API called with:", uid, newEmail);

    if (!uid || !newEmail) {
      return NextResponse.json(
        { error: "Missing uid or newEmail" },
        { status: 400 }
      );
    }

    // 1. Update Firebase Auth user
    await admin.auth().updateUser(uid, { email: newEmail });

    // 2. Update Firestore profile doc (create if missing)
    await db.collection("users").doc(uid).set(
      {
        email: newEmail,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true } // merge = safe update (no overwrite of other fields)
    );

    return NextResponse.json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (err) {
    console.error("Change Email API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
