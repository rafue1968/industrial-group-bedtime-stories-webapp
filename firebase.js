// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Rafue's Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAJTtMKEbsiRI7H1WOHiokeWeAARAgHtOQ",
  authDomain: "bedtime-stories-webapp.firebaseapp.com",
  projectId: "bedtime-stories-webapp",
  storageBucket: "bedtime-stories-webapp.firebasestorage.app",
  messagingSenderId: "857657757677",
  appId: "1:857657757677:web:edb179d13860cc6ddee1e4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
