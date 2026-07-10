import { persianSearchText } from "./i18n.js";
import { isFirebaseConfigured } from "./firebase.js";
import { fetchCloudBooks } from "./storage.js";

let booksCache = null;

async function loadLocalBooks() {
  const res = await fetch("data/books.json");
  if (!res.ok) throw new Error("Failed to load books");
  return res.json();
}

export async function loadBooks() {
  if (booksCache) return booksCache;

  if (isFirebaseConfigured()) {
    try {
      const cloudBooks = await fetchCloudBooks();
      if (cloudBooks.length) {
        booksCache = cloudBooks;
        return booksCache;
      }
      // ابر خالی است — از فایل محلی به‌عنوان نمایش موقت استفاده کن
      booksCache = await loadLocalBooks();
      return booksCache;
    } catch (error) {
      console.warn("Cloud load failed, falling back to local JSON:", error);
      booksCache = await loadLocalBooks();
      return booksCache;
    }
  }

  booksCache = await loadLocalBooks();
  return booksCache;
}

export function invalidateBooksCache() {
  booksCache = null;
}

export function getBookById(books, id) {
  return books.find((b) => b.id === id);
}

export function uniqueValues(books, field) {
  return [...new Set(books.map((b) => b[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "fa")
  );
}

export function searchBooks(books, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return books.filter((book) => {
    const haystack = persianSearchText(book).toLowerCase();
    return haystack.includes(q);
  });
}

export function filterBooks(books, type, value) {
  const decoded = decodeURIComponent(value);

  switch (type) {
    case "genre":
      return books.filter((b) => b.genre === decoded);
    case "country":
      return books.filter((b) => b.country === decoded);
    case "author":
      return books.filter((b) => b.author === decoded);
    case "school":
      return books.filter((b) => b.literarySchool === decoded);
    default:
      return [];
  }
}

export function relatedBooks(books, book) {
  const sameAuthor = books.filter(
    (b) => b.id !== book.id && b.author === book.author
  );
  const sameGenre = books.filter(
    (b) => b.id !== book.id && b.genre === book.genre && b.author !== book.author
  );
  const sameCountry = books.filter(
    (b) =>
      b.id !== book.id &&
      b.country === book.country &&
      b.author !== book.author &&
      b.genre !== book.genre
  );

  const seen = new Set();
  const related = [];

  for (const group of [sameAuthor, sameGenre, sameCountry]) {
    for (const b of group) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        related.push(b);
      }
    }
  }

  return related.slice(0, 6);
}
