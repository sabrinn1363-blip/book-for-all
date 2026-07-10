import {
  getFirebase,
  isFirebaseConfigured,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch
} from "./firebase.js";

const BOOKS = "books";

function sortBooks(books) {
  return [...books].sort((a, b) =>
    String(b.addedAt || "").localeCompare(String(a.addedAt || ""))
  );
}

function normalizeBook(id, data) {
  return {
    id,
    title: data.title || "",
    author: data.author || "",
    translator: data.translator || "—",
    publisher: data.publisher || "—",
    year: Number(data.year) || 0,
    country: data.country || "",
    genre: data.genre || "",
    literarySchool: data.literarySchool || "",
    historicalPeriod: data.historicalPeriod || "",
    pages: Number(data.pages) || 0,
    summary: data.summary || "",
    review: data.review || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    cover: data.cover || "",
    addedAt: data.addedAt || ""
  };
}

export async function fetchCloudBooks() {
  const { db } = getFirebase();
  const snap = await getDocs(collection(db, BOOKS));
  const books = [];

  snap.forEach((item) => {
    books.push(normalizeBook(item.id, item.data()));
  });

  return sortBooks(books);
}

export async function fetchCloudBookById(id) {
  const { db } = getFirebase();
  const snap = await getDoc(doc(db, BOOKS, id));
  if (!snap.exists()) return null;
  return normalizeBook(snap.id, snap.data());
}

export async function saveCloudBook(book) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase پیکربندی نشده است.");
  }

  const { db } = getFirebase();
  const { id, ...data } = book;
  await setDoc(doc(db, BOOKS, id), data, { merge: true });
  return book;
}

export async function deleteCloudBook(id) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase پیکربندی نشده است.");
  }

  const { db } = getFirebase();
  await deleteDoc(doc(db, BOOKS, id));
}

export async function seedCloudBooks(books) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase پیکربندی نشده است.");
  }

  const { db } = getFirebase();
  const existing = await getDocs(collection(db, BOOKS));
  if (!existing.empty) {
    return { seeded: 0, skipped: true, total: existing.size };
  }

  const batch = writeBatch(db);
  for (const book of books) {
    const { id, ...data } = book;
    batch.set(doc(db, BOOKS, id), data);
  }
  await batch.commit();
  return { seeded: books.length, skipped: false, total: books.length };
}

export function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
