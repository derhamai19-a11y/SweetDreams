import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error(
    `Missing Firebase env vars in Vite. Add these values in Netlify Build Environment or local .env: ${missingKeys.join(", ")}`
  );
}

let firebaseApp = null;
let _auth = null;
let _db = null;
let _storage = null;

if (missingKeys.length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
  _auth = getAuth(firebaseApp);
  _db = getFirestore(firebaseApp);
  _storage = getStorage(firebaseApp);
}

export const firebaseConfigured = missingKeys.length === 0;
export const firebaseConfigError = missingKeys.length > 0
  ? new Error(`Missing Firebase configuration: ${missingKeys.join(", ")}`)
  : null;

export const auth = _auth;
export const db = _db;
export const storage = _storage;
export default firebaseApp;
