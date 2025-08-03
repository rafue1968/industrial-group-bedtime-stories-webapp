// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJTtMKEbsiRI7H1WOHiokeWeAARAgHtOQ",
  authDomain: "bedtime-stories-webapp.firebaseapp.com",
  projectId: "bedtime-stories-webapp",
  storageBucket: "bedtime-stories-webapp.firebasestorage.app",
  messagingSenderId: "857657757677",
  appId: "1:857657757677:web:edb179d13860cc6ddee1e4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);