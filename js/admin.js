import {
  getFirebase,
  isFirebaseConfigured,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "./firebase.js";

let currentUser = null;
let authReady = null;

export function isCloudAdmin() {
  return isFirebaseConfigured();
}

export function isAdmin() {
  if (!isFirebaseConfigured()) return false;
  return Boolean(currentUser);
}

export function getAdminEmail() {
  return currentUser?.email || "";
}

export function waitForAuth() {
  if (!isFirebaseConfigured()) {
    return Promise.resolve(null);
  }

  if (!authReady) {
    const { auth } = getFirebase();
    authReady = new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        currentUser = user;
        resolve(user);
        authReady = Promise.resolve(user);
      });
    });
  }

  return authReady;
}

export async function loginAdmin(email, password) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase پیکربندی نشده است. فایل js/firebase-config.js را پر کنید.");
  }

  const { auth } = getFirebase();
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  currentUser = cred.user;
  return true;
}

export async function logoutAdmin() {
  if (!isFirebaseConfigured()) return;
  const { auth } = getFirebase();
  await signOut(auth);
  currentUser = null;
}

export function authErrorMessage(error) {
  const code = error?.code || "";
  const map = {
    "auth/invalid-email": "ایمیل معتبر نیست.",
    "auth/user-disabled": "این حساب غیرفعال است.",
    "auth/user-not-found": "ایمیل یا رمز اشتباه است.",
    "auth/wrong-password": "ایمیل یا رمز اشتباه است.",
    "auth/invalid-credential": "ایمیل یا رمز اشتباه است.",
    "auth/too-many-requests": "تلاش زیاد. کمی بعد دوباره امتحان کنید."
  };
  return map[code] || error?.message || "ورود ممکن نشد.";
}
