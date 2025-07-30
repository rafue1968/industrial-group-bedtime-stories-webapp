import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, provider, db } from '@/FirebaseConfig'; 
//get the user credentials from auth
const CreateUserIfNotExists = async (user) => {
  console.log("CreateUserIfNotExists received:", user);
  if (!user) {
    console.log("No user object passed.");
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {//add whatevere???!!!!
      email: user.email,
      history: [],
      createdAt: serverTimestamp(),
      isAdmin: false
    });
    console.log("✅ Firestore user document created.");
  } else {
    console.log("ℹ️ User doc already exists.");
  }
};
    console.log("ℹ️ User doc already exists.");
  

export default CreateUserIfNotExists;
