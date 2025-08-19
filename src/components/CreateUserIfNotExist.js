import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../../lib/firebase";

const CreateUserIfNotExists = async (user) => {
  if (!user) {
    console.log("No user object passed.");
    return { created: false, reason: "no-user" };
  }

  try {
    const userRef = doc(firestore, "users", user.uid);

    await setDoc(
      userRef,
      {
        email: user.email ?? null,    // handles anonymous users
        history: [],
        createdAt: serverTimestamp(),
        isAdmin: false,
      },
      { merge: true } // ensures existing docs aren't overwritten
    );

    console.log("Firestore user document created/updated.");
    return { created: true };
  } catch (err) {
    console.error("CreateUserIfNotExists failed:", err);
    return { created: false, reason: "error", error: err };
  }
};

export default CreateUserIfNotExists;
