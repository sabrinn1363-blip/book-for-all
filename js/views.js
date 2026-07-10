import {
  SITE_NAME,
  displayCountry,
  displayGenre,
  displaySchool,
  displayPeriod,
  displayBrowseType,
  bookCount,
  resultCount,
  countryLabels,
  genreLabels,
  schoolLabels,
  periodLabels
} from "./i18n.js";
import { makePlaceholderCover } from "./book-form.js";

export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function coverSrc(book) {
  const cover = book.cover || "";
  if (cover.startsWith("http") || cover.startsWith("assets/")) {
    return escapeAttr(cover);
  }
  return escapeAttr(makePlaceholderCover(book.title));
}

export function bookCard(book) {
  return `
    <li class="book-card">
      <a href="#/book/${encodeURIComponent(book.id)}">
        <img class="book-cover" src="${coverSrc(book)}" alt="جلد ${escapeHtml(book.title)}" loading="lazy" width="200" height="300">
        <div class="book-card-body">
          <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
          <p class="book-card-author">${escapeHtml(book.author)}</p>
        </div>
      </a>
    </li>`;
}

export function bookGrid(books) {
  if (!books.length) {
    return '<p class="empty-state">کتابی یافت نشد.</p>';
  }
  return `<ul class="book-grid">${books.map(bookCard).join("")}</ul>`;
}

export function chipList(items, type) {
  if (!items.length) return "";
  return `<ul class="chip-list">${items
    .map((item) => {
      const value = typeof item === "object" ? item.value : item;
      const label = typeof item === "object" ? item.label : item;
      return `<li><a href="#/browse/${type}/${encodeURIComponent(value)}">${escapeHtml(label)}</a></li>`;
    })
    .join("")}</ul>`;
}

export function renderHome(books, genres, countries, authors) {
  const recent = [...books]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    .slice(0, 6);

  const countryChips = countries.map((c) => ({
    value: c,
    label: displayCountry(c)
  }));

  const genreChips = genres.map((g) => ({
    value: g,
    label: displayGenre(g)
  }));

  return `
    <h1 class="page-title">${SITE_NAME}</h1>
    <p class="page-subtitle">پایگاه اطلاعات کتاب — قابل جستجو و مرور</p>

    <form class="search-form hero-search" id="hero-search" role="search">
      <input type="search" name="q" placeholder="جستجو بر اساس عنوان، نویسنده، ژانر، کشور…" aria-label="جستجوی کتاب" autocomplete="off">
      <button type="submit">جستجو</button>
    </form>

    <section class="section">
      <h2 class="section-title">ژانرها</h2>
      ${chipList(genreChips, "genre")}
    </section>

    <section class="section">
      <h2 class="section-title">کشورها</h2>
      ${chipList(countryChips, "country")}
    </section>

    <section class="section">
      <h2 class="section-title">نویسندگان</h2>
      ${chipList(authors, "author")}
    </section>

    <section class="section">
      <h2 class="section-title">تازه‌ترین کتاب‌ها</h2>
      ${bookGrid(recent)}
    </section>`;
}

export function renderSearch(query, results) {
  return `
    <h1 class="page-title">نتایج جستجو</h1>
    <p class="results-count">${resultCount(results.length, query)}</p>
    ${bookGrid(results)}`;
}

export function renderBrowse(type, value, results) {
  const displayValue =
    type === "country"
      ? displayCountry(value)
      : type === "genre"
        ? displayGenre(value)
        : type === "school"
          ? displaySchool(value)
          : value;

  return `
    <h1 class="page-title">${escapeHtml(displayValue)}</h1>
    <p class="page-subtitle">${displayBrowseType(type)} · ${bookCount(results.length)}</p>
    ${bookGrid(results)}`;
}

export function renderBook(book, related) {
  const link = (type, val, label) =>
    val && val !== "—"
      ? `<a href="#/browse/${type}/${encodeURIComponent(val)}">${escapeHtml(label || val)}</a>`
      : escapeHtml(val || "—");

  return `
    <article class="book-detail">
      <img class="book-detail-cover" src="${coverSrc(book)}" alt="جلد ${escapeHtml(book.title)}" width="220" height="330">
      <div>
        <h1 class="book-detail-title">${escapeHtml(book.title)}</h1>
        <p class="book-detail-author">اثر ${link("author", book.author)}</p>

        <dl class="meta-grid">
          <div class="meta-item"><dt>مترجم</dt><dd>${escapeHtml(book.translator)}</dd></div>
          <div class="meta-item"><dt>ناشر</dt><dd>${escapeHtml(book.publisher)}</dd></div>
          <div class="meta-item"><dt>سال انتشار</dt><dd>${book.year}</dd></div>
          <div class="meta-item"><dt>کشور</dt><dd><a href="#/browse/country/${encodeURIComponent(book.country)}">${escapeHtml(displayCountry(book.country))}</a></dd></div>
          <div class="meta-item"><dt>ژانر</dt><dd>${link("genre", book.genre, displayGenre(book.genre))}</dd></div>
          <div class="meta-item"><dt>مکتب ادبی</dt><dd>${link("school", book.literarySchool, displaySchool(book.literarySchool))}</dd></div>
          <div class="meta-item"><dt>دوره تاریخی</dt><dd>${escapeHtml(displayPeriod(book.historicalPeriod))}</dd></div>
          <div class="meta-item"><dt>تعداد صفحات</dt><dd>${book.pages}</dd></div>
        </dl>

        <div class="prose">
          <h2>خلاصه</h2>
          <p>${escapeHtml(book.summary)}</p>
        </div>

        <div class="prose">
          <h2>نقد کوتاه</h2>
          <p>${escapeHtml(book.review)}</p>
        </div>

        ${
          book.tags?.length
            ? `<div class="prose"><h2>برچسب‌ها</h2><ul class="tag-list">${book.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul></div>`
            : ""
        }

        ${
          related.length
            ? `<section class="related-section">
                <h2 class="section-title">کتاب‌های مرتبط</h2>
                ${bookGrid(related)}
              </section>`
            : ""
        }
      </div>
    </article>`;
}

export function renderNotFound() {
  return `
    <h1 class="page-title">یافت نشد</h1>
    <p class="page-subtitle">صفحه‌ای که دنبالش هستید وجود ندارد.</p>
    <p><a href="#/">بازگشت به صفحه اصلی ←</a></p>`;
}

export function renderAdminLogin(error = "") {
  return `
    <h1 class="page-title">ورود ادمین</h1>
    <p class="page-subtitle">فقط صاحب سایت می‌تواند کتاب اضافه یا ویرایش کند. کتاب‌ها برای همه کاربران آنلاین ذخیره می‌شوند.</p>

    <form class="book-form admin-login-form" id="admin-login-form">
      <label class="form-field">
        <span>ایمیل</span>
        <input type="email" name="email" required autocomplete="username" placeholder="admin@example.com">
      </label>
      <label class="form-field">
        <span>رمز عبور</span>
        <input type="password" name="password" required autocomplete="current-password" placeholder="رمز پنل مدیریت">
      </label>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ""}
      <div class="form-actions">
        <button type="submit" class="btn">ورود</button>
        <a href="#/" class="btn btn-secondary">بازگشت</a>
      </div>
    </form>`;
}

export function renderAdminDenied() {
  return `
    <h1 class="page-title">دسترسی محدود</h1>
    <p class="page-subtitle">این بخش فقط برای ادمین سایت است. کاربران عادی فقط می‌توانند کتاب‌ها را ببینند و جستجو کنند.</p>
    <p><a href="#/admin" class="btn">ورود ادمین</a> <a href="#/" class="btn btn-secondary">صفحه اصلی</a></p>`;
}

function selectOptions(labels, selected = "") {
  return Object.entries(labels)
    .map(([value, label]) => {
      const isSelected = value === selected ? " selected" : "";
      return `<option value="${escapeHtml(value)}"${isSelected}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function formField(label, inputHtml) {
  return `<label class="form-field"><span>${label}</span>${inputHtml}</label>`;
}

export function renderAddBook(book = null) {
  const isEdit = Boolean(book);
  const tags = book?.tags?.join(" | ") || "";

  return `
    <h1 class="page-title">${isEdit ? "ویرایش کتاب" : "افزودن کتاب"}</h1>
    <p class="page-subtitle">اطلاعات کتاب را وارد کنید و ذخیره کنید.</p>

    <form class="book-form" id="add-book-form" novalidate>
      ${isEdit ? `<input type="hidden" name="id" value="${escapeHtml(book.id)}">` : ""}

      <div class="form-grid">
        ${formField("عنوان *", `<input type="text" name="title" required value="${escapeHtml(book?.title || "")}" placeholder="مثلاً جنایت و مکافات">`)}
        ${formField("نویسنده *", `<input type="text" name="author" required value="${escapeHtml(book?.author || "")}" placeholder="مثلاً فئودور داستایوفسکی">`)}
        ${formField("مترجم", `<input type="text" name="translator" value="${escapeHtml(book?.translator || "")}" placeholder="اگر ندارد خالی بگذارید">`)}
        ${formField("ناشر", `<input type="text" name="publisher" value="${escapeHtml(book?.publisher || "")}" placeholder="مثلاً نشر نی">`)}
        ${formField("سال انتشار", `<input type="number" name="year" min="1" max="2100" value="${book?.year || ""}" placeholder="1866">`)}
        ${formField("تعداد صفحات", `<input type="number" name="pages" min="1" value="${book?.pages || ""}" placeholder="300">`)}
        ${formField("کشور", `<select name="country"><option value="">انتخاب کنید…</option>${selectOptions(countryLabels, book?.country || "")}</select>`)}
        ${formField("ژانر", `<select name="genre"><option value="">انتخاب کنید…</option>${selectOptions(genreLabels, book?.genre || "")}</select>`)}
        ${formField("مکتب ادبی", `<select name="literarySchool"><option value="">انتخاب کنید…</option>${selectOptions(schoolLabels, book?.literarySchool || "")}</select>`)}
        ${formField("دوره تاریخی", `<select name="historicalPeriod"><option value="">انتخاب کنید…</option>${selectOptions(periodLabels, book?.historicalPeriod || "")}</select>`)}
        ${formField("برچسب‌ها", `<input type="text" name="tags" value="${escapeHtml(tags)}" placeholder="کلاسیک | روان‌شناسی">`)}
        ${formField("آدرس تصویر جلد", `<input type="url" name="coverUrl" value="${book?.cover?.startsWith("http") ? escapeHtml(book.cover) : ""}" placeholder="اختیاری — اگر خالی باشد جلد خودکار ساخته می‌شود">`)}
      </div>

      ${formField("خلاصه", `<textarea name="summary" rows="4" placeholder="خلاصه کوتاه کتاب…">${escapeHtml(book?.summary || "")}</textarea>`)}
      ${formField("نقد کوتاه", `<textarea name="review" rows="4" placeholder="نقد یا توضیح کوتاه…">${escapeHtml(book?.review || "")}</textarea>`)}

      <div class="form-actions">
        <button type="submit" class="btn">${isEdit ? "ذخیره تغییرات" : "افزودن کتاب"}</button>
        <a href="#/manage" class="btn btn-secondary">مدیریت کتاب‌ها</a>
      </div>

      <p class="form-hint">کتاب‌ها در ابر ذخیره می‌شوند و همه کاربران سایت فوراً آن‌ها را می‌بینند.</p>
    </form>`;
}

export function renderManage(allBooks, adminEmail = "", cloudEmpty = false) {
  const rows = allBooks.length
    ? allBooks
        .map(
          (book) => `
        <li class="manage-item">
          <div>
            <strong>${escapeHtml(book.title)}</strong>
            <span class="manage-meta">${escapeHtml(book.author)} · ${escapeHtml(book.addedAt)}</span>
          </div>
          <div class="manage-actions">
            <a href="#/book/${encodeURIComponent(book.id)}" class="btn btn-small btn-secondary">مشاهده</a>
            <a href="#/edit/${encodeURIComponent(book.id)}" class="btn btn-small btn-secondary">ویرایش</a>
            <button type="button" class="btn btn-small btn-danger" data-delete-book="${escapeHtml(book.id)}">حذف</button>
          </div>
        </li>`
        )
        .join("")
    : `<li class="manage-empty">هنوز کتابی در پایگاه نیست. <a href="#/add">افزودن کتاب</a></li>`;

  return `
    <h1 class="page-title">مدیریت کتاب‌ها</h1>
    <p class="page-subtitle">${bookCount(allBooks.length)} در پایگاه ابری${adminEmail ? ` · ${escapeHtml(adminEmail)}` : ""}</p>

    <div class="manage-toolbar">
      <a href="#/add" class="btn">افزودن کتاب جدید</a>
      <button type="button" class="btn btn-secondary" id="export-books">دانلود پشتیبان</button>
      ${
        cloudEmpty
          ? `<button type="button" class="btn btn-secondary" id="seed-books">بارگذاری کتاب‌های اولیه</button>`
          : ""
      }
    </div>

    <ul class="manage-list">${rows}</ul>

    <p class="form-hint">هر تغییری بلافاصله برای همه بازدیدکنندگان سایت اعمال می‌شود.</p>`;
}
