import {
  getFirebase,
  isFirebaseConfigured,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "./firebase.js";

let currentUser = null;
let authListenerStarted = false;

function startAuthListener() {
  if (!isFirebaseConfigured() || authListenerStarted) return;
  const { auth } = getFirebase();
  authListenerStarted = true;
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
  });
}

export function isCloudAdmin() {
  return isFirebaseConfigured();
}

export function isAdmin() {
  if (!isFirebaseConfigured()) return false;
  startAuthListener();
  return Boolean(currentUser);
}

export function getAdminEmail() {
  return currentUser?.email || "";
}

export function waitForAuth() {
  if (!isFirebaseConfigured()) {
    return Promise.resolve(null);
  }

  startAuthListener();
  const { auth } = getFirebase();

  if (auth.currentUser) {
    currentUser = auth.currentUser;
    return Promise.resolve(currentUser);
  }

  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      unsub();
      resolve(user);
    });
  });
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
    "auth/too-many-requests": "تلاش زیاد. کمی بعد دوباره امتحان کنید.",
    "auth/network-request-failed":
      "اتصال به سرور ممکن نشد. اینترنت را چک کنید. اگر در ایران هستید، VPN روشن کنید یا در Chrome باز کنید (نه داخل واتساپ)."
  };
  return map[code] || error?.message || "ورود ممکن نشد.";
}
