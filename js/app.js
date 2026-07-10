import {
  loadBooks,
  getBookById,
  uniqueValues,
  searchBooks,
  filterBooks,
  relatedBooks,
  invalidateBooksCache
} from "./data.js";
import {
  SITE_NAME,
  displayCountry,
  displayGenre,
  displaySchool
} from "./i18n.js";
import {
  renderHome,
  renderSearch,
  renderBrowse,
  renderBook,
  renderNotFound,
  renderAddBook,
  renderManage,
  renderAdminLogin,
  renderAdminDenied
} from "./views.js";
import {
  saveCloudBook,
  deleteCloudBook,
  fetchCloudBookById,
  fetchCloudBooks,
  seedCloudBooks,
  downloadJson
} from "./storage.js";
import { makeBookId, today } from "./book-form.js";
import {
  isAdmin,
  loginAdmin,
  logoutAdmin,
  waitForAuth,
  getAdminEmail,
  authErrorMessage
} from "./admin.js";
import { isFirebaseConfigured } from "./firebase.js";

const app = document.getElementById("app");
const headerSearch = document.getElementById("header-search");
const adminNav = document.getElementById("admin-nav");
const adminLogout = document.getElementById("admin-logout");
let books = [];
let cloudBookCount = null;

function parseRoute() {
  const hash = location.hash.slice(1) || "/";
  const [path, queryString] = hash.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(queryString || "");

  return { parts, params };
}

function setPageTitle(title) {
  document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
}

function browseTitle(type, value) {
  if (type === "country") return displayCountry(value);
  if (type === "genre") return displayGenre(value);
  if (type === "school") return displaySchool(value);
  return value;
}

async function refreshBooks() {
  invalidateBooksCache();
  books = await loadBooks();
  if (isFirebaseConfigured()) {
    try {
      cloudBookCount = (await fetchCloudBooks()).length;
    } catch {
      cloudBookCount = null;
    }
  }
}

function syncAdminNav() {
  if (!adminNav) return;
  adminNav.hidden = !isAdmin();
}

function bindSearchForms() {
  for (const form of document.querySelectorAll(".search-form")) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new FormData(form).get("q")?.toString().trim();
      if (q) {
        location.hash = `#/search?q=${encodeURIComponent(q)}`;
      }
    });
  }
}

function syncHeaderSearch(query) {
  const input = headerSearch?.querySelector('input[name="q"]');
  if (input) input.value = query || "";
}

async function bookFromForm(form) {
  const data = new FormData(form);
  const title = data.get("title")?.toString().trim() || "";
  const author = data.get("author")?.toString().trim() || "";

  if (!title || !author) {
    throw new Error("عنوان و نویسنده الزامی است.");
  }

  const existingId = data.get("id")?.toString().trim();
  const id = existingId || makeBookId(title, author);
  const coverUrl = data.get("coverUrl")?.toString().trim();
  const tags = (data.get("tags")?.toString() || "")
    .split(/[|،,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  let addedAt = today();
  if (existingId) {
    const existing =
      getBookById(books, existingId) || (await fetchCloudBookById(existingId));
    if (existing?.addedAt) addedAt = existing.addedAt;
  }

  return {
    id,
    title,
    author,
    translator: data.get("translator")?.toString().trim() || "—",
    publisher: data.get("publisher")?.toString().trim() || "—",
    year: Number(data.get("year")) || new Date().getFullYear(),
    country: data.get("country")?.toString() || "",
    genre: data.get("genre")?.toString() || "",
    literarySchool: data.get("literarySchool")?.toString() || "",
    historicalPeriod: data.get("historicalPeriod")?.toString() || "",
    pages: Number(data.get("pages")) || 0,
    summary: data.get("summary")?.toString().trim() || "",
    review: data.get("review")?.toString().trim() || "",
    tags,
    cover: coverUrl || "",
    addedAt
  };
}

function bindAddBookForm() {
  const form = document.getElementById("add-book-form");
  if (!form || !isAdmin()) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (!isFirebaseConfigured()) {
        throw new Error(
          "Firebase پیکربندی نشده. فایل js/firebase-config.js را پر کنید."
        );
      }
      const book = await bookFromForm(form);
      await saveCloudBook(book);
      await refreshBooks();
      location.hash = `#/book/${encodeURIComponent(book.id)}`;
    } catch (error) {
      alert(error.message || "ذخیره کتاب ممکن نشد.");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function bindManagePage() {
  if (!isAdmin()) return;

  document.getElementById("export-books")?.addEventListener("click", () => {
    downloadJson("books.json", books);
  });

  document.getElementById("seed-books")?.addEventListener("click", async () => {
    if (!confirm("کتاب‌های نمونه از فایل محلی به ابر منتقل شوند؟")) return;
    try {
      const res = await fetch("data/books.json");
      if (!res.ok) throw new Error("خواندن فایل محلی ممکن نشد.");
      const localBooks = await res.json();
      const result = await seedCloudBooks(localBooks);
      if (result.skipped) {
        alert(`ابر از قبل ${result.total} کتاب دارد. seed انجام نشد.`);
      } else {
        alert(`${result.seeded} کتاب به ابر منتقل شد.`);
      }
      await refreshBooks();
      render();
    } catch (error) {
      alert(error.message || "بارگذاری اولیه ممکن نشد.");
    }
  });

  for (const button of document.querySelectorAll("[data-delete-book]")) {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-delete-book");
      if (!id || !confirm("این کتاب حذف شود؟")) return;
      try {
        await deleteCloudBook(id);
        await refreshBooks();
        render();
      } catch (error) {
        alert(error.message || "حذف ممکن نشد.");
      }
    });
  }
}

function bindAdminLogin() {
  const form = document.getElementById("admin-login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = data.get("email")?.toString() || "";
    const password = data.get("password")?.toString() || "";
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      await loginAdmin(email, password);
      syncAdminNav();
      location.hash = "#/manage";
    } catch (error) {
      app.innerHTML = renderAdminLogin(authErrorMessage(error));
      setPageTitle("ورود مشتری");
      bindAdminLogin();
    }
  });
}

adminLogout?.addEventListener("click", async () => {
  await logoutAdmin();
  syncAdminNav();
  location.hash = "#/";
});

async function render() {
  const { parts, params } = parseRoute();
  await waitForAuth();
  syncAdminNav();

  try {
    if (!books.length) {
      books = await loadBooks();
      if (isFirebaseConfigured()) {
        try {
          cloudBookCount = (await fetchCloudBooks()).length;
        } catch {
          cloudBookCount = null;
        }
      }
    }
  } catch {
    app.innerHTML =
      '<p class="empty-state">بارگذاری کتاب‌ها ممکن نشد. اتصال اینترنت و پیکربندی Firebase را بررسی کنید.</p>';
    return;
  }

  const genres = uniqueValues(books, "genre");
  const countries = uniqueValues(books, "country");
  const authors = uniqueValues(books, "author");
  const admin = isAdmin();
  const cloudEmpty =
    isFirebaseConfigured() && cloudBookCount === 0;

  let html = "";

  if (parts.length === 0) {
    html = renderHome(books, genres, countries, authors);
    setPageTitle("");
  } else if (parts[0] === "search") {
    const q = params.get("q") || "";
    const results = searchBooks(books, q);
    html = renderSearch(q, results);
    setPageTitle(`جستجو: ${q}`);
    syncHeaderSearch(q);
  } else if (parts[0] === "browse" && parts[1] && parts[2]) {
    const type = parts[1];
    const value = decodeURIComponent(parts.slice(2).join("/"));
    const results = filterBooks(books, type, value);
    html = renderBrowse(type, value, results);
    setPageTitle(browseTitle(type, value));
  } else if (parts[0] === "admin") {
    if (!isFirebaseConfigured()) {
      html = renderAdminLogin(
        "Firebase هنوز پیکربندی نشده. توسعه‌دهنده باید js/firebase-config.js را پر کند."
      );
      setPageTitle("ورود مشتری");
    } else if (admin) {
      location.hash = "#/manage";
      return;
    } else {
      html = renderAdminLogin();
      setPageTitle("ورود مشتری");
    }
  } else if (parts[0] === "add") {
    if (!admin) {
      html = renderAdminDenied();
      setPageTitle("دسترسی محدود");
    } else {
      html = renderAddBook();
      setPageTitle("افزودن کتاب");
    }
  } else if (parts[0] === "edit" && parts[1]) {
    if (!admin) {
      html = renderAdminDenied();
      setPageTitle("دسترسی محدود");
    } else {
      const id = decodeURIComponent(parts[1]);
      const book =
        getBookById(books, id) || (await fetchCloudBookById(id));
      if (book) {
        html = renderAddBook(book);
        setPageTitle("ویرایش کتاب");
      } else {
        html = renderNotFound();
        setPageTitle("یافت نشد");
      }
    }
  } else if (parts[0] === "manage") {
    if (!admin) {
      html = renderAdminDenied();
      setPageTitle("دسترسی محدود");
    } else {
      // وقتی ابر خالی است، لیست محلی را به‌عنوان مدیریت نشان نده — اول seed
      const manageBooks = cloudEmpty ? [] : books;
      html = renderManage(manageBooks, getAdminEmail(), cloudEmpty);
      setPageTitle("مدیریت کتاب‌ها");
    }
  } else if (parts[0] === "book" && parts[1]) {
    const id = decodeURIComponent(parts[1]);
    const book = getBookById(books, id);
    if (book) {
      const related = relatedBooks(books, book);
      html = renderBook(book, related);
      setPageTitle(book.title);
    } else {
      html = renderNotFound();
      setPageTitle("یافت نشد");
    }
  } else {
    html = renderNotFound();
    setPageTitle("یافت نشد");
  }

  app.innerHTML = html;
  bindSearchForms();
  bindAdminLogin();
  bindAddBookForm();
  bindManagePage();

  if (parts[0] !== "search") syncHeaderSearch("");
}

window.addEventListener("hashchange", render);

waitForAuth().then(() => {
  syncAdminNav();
  render();
});
