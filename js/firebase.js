import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig, firebaseEnabled } from "./firebase-config.js";

let app = null;
let auth = null;
let db = null;

export function isFirebaseConfigured() {
  if (!firebaseEnabled) return false;
  const key = firebaseConfig?.apiKey || "";
  return Boolean(key && !key.startsWith("YOUR_"));
}

export function getFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase پیکربندی نشده است.");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { app, auth, db };
}

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch
};
