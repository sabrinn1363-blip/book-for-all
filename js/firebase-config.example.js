/**
 * کپی کنید به firebase-config.js و مقادیر پروژه Firebase خود را بگذارید.
 * Firebase Console → Project settings → Your apps → Web app
 */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/** اگر false باشد، سایت فقط از data/books.json محلی می‌خواند (بدون ابر) */
export const firebaseEnabled = true;
