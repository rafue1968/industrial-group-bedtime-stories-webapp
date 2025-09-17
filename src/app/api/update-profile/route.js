import { db, auth } from "../../../../lib/firebaseAdmin";

export async function POST(req) {
  try {
    const body = await req.json();
    const { displayName ,phoneNumber,password,email} = body;

    if (!displayName && !phoneNumber && !password && !email) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400 }
      );
    }

    const idToken = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if(displayName){
    await auth.updateUser(uid, { displayName });
    await db.collection("users").doc(uid).update({ displayName });
    }


    if (phoneNumber) {
      await db.collection("users").doc(uid).update({ phoneNumber });
    }

    if (password) {
      await auth.updateUser(uid, { password });
    }

    if (email) {
      await auth.updateUser(uid, { email });
      await db.collection("users").doc(uid).update({ email });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Profile updated Succesfuly" }),
      { status: 200 }
    );

  } catch (error) {
  console.error("Update error:", error);
  return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  }
}



export async function DELETE(req) {
  try {
    const idToken = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    await db.collection("users").doc(uid).delete();

    const collections = ["contactMessages", "summaries", "stories", "newsletterSubscribers"];

   for (const collectionName of collections) {
  const snapById = await db.collection(collectionName).where("userId", "==", uid).get();
  const batch1 = db.batch();
  snapById.forEach((doc) => batch1.delete(doc.ref));
  await batch1.commit();

  const snapByEmail = await db.collection(collectionName).where("email", "==", decodedToken.email).get();
  const batch2 = db.batch();
  snapByEmail.forEach((doc) => batch2.delete(doc.ref));
  await batch2.commit();
}

    await auth.deleteUser(uid);

    return new Response(
      JSON.stringify({ success: true, message: "Account and all related data deleted successfully" }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Delete error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
