import { NextResponse } from "next/server";
import { admin, db } from "../../../../lib/firebaseAdmin";

// Handle DELETE request to delete a user by UID
export async function DELETE(req) {
  try {
    const { uid } = await req.json();
    console.log("🗑️ Delete API called with:", uid);

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid" },
        { status: 400 }
      );
    }

    // 1. Delete user from Firebase Auth
    await admin.auth().deleteUser(uid);

    // 2. Delete user document from Firestore
    await db.collection("users").doc(uid).delete();

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
