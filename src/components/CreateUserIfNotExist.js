import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from '../../lib/firebase'; 
const CreateUserIfNotExists = async (user) => {
  console.log("CreateUserIfNotExists received:", user);
  if (!user) {
    console.log("No user object passed.");
    return;
  }

  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      displayName: user.displayName || "",
      phoneNumber: user.phoneNumber,
      email: user.email,
      history: [],
      createdAt: serverTimestamp(),
      isAdmin: false,
      uid: user.uid,
      lastLoginAt: serverTimestamp(),
    });
    console.log("Firestore user document created.");
  } else {
    console.log("User doc already exists.");
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp()
    }, { merge: true })
  }
};
    console.log("User doc already exists.");
  

export default CreateUserIfNotExists;