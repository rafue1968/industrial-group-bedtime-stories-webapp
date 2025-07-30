// lib/firebaseAdmin.js
import admin from "firebase-admin";
import path from "path";
import { readFileSync } from "fs";

// Absolute path to serviceAccountKey.json
const serviceAccountPath = path.resolve(process.cwd(), "serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore(); 

export { db }; 
