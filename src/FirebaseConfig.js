// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- Add this

const firebaseConfig = {
  apiKey: "AIzaSyAJTtMKEbsiRI7H1WOHiokeWeAARAgHtOQ",
  authDomain: "bedtime-stories-webapp.firebaseapp.com",
  projectId: "bedtime-stories-webapp",
  storageBucket: "bedtime-stories-webapp.appspot.com",
  messagingSenderId: "857657757677",
  appId: "1:857657757677:web:edb179d13860cc6ddee1e4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); 

export { auth, provider, db };