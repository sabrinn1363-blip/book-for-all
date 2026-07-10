# Book for All / کتاب برای همه

A searchable book information site. Visitors browse and search. The client (admin) adds books online; changes sync to everyone via Firebase.

## Features

- Search by title, author, genre, country, literary school
- Browse by genre, country, or author
- Book detail pages with related books
- Admin panel (`#/admin`) — add / edit / delete books in the cloud
- Deploy free on Cloudflare Pages

## Quick start (local)

```bash
python -m http.server 8080
```

Open http://localhost:8080

Until Firebase is configured, books load from `data/books.json`.

## Cloud setup (required for shared books)

1. Create a Firebase project (Auth Email/Password + Firestore)
2. Copy web config into [`js/firebase-config.js`](js/firebase-config.js)
3. Publish rules from [`firestore.rules`](firestore.rules)
4. Create one admin user in Firebase Authentication
5. Deploy to Cloudflare Pages
6. Log in at `#/admin` → **بارگذاری کتاب‌های اولیه** (once)

Full steps (Persian): [`docs/راه‌اندازی-ابر.md`](docs/راه‌اندازی-ابر.md)

## Deliver to client (no source code)

Give the client only:

- Site URL
- Admin email + password
- [`docs/تحویل-به-مشتری.md`](docs/تحویل-به-مشتری.md)

## Project structure

```
├── index.html
├── css/style.css
├── js/
│   ├── app.js
│   ├── data.js          # load books (cloud or local)
│   ├── storage.js       # Firestore CRUD
│   ├── admin.js         # Firebase Auth
│   ├── firebase.js
│   ├── firebase-config.js
│   └── views.js
├── data/books.json      # seed / offline fallback
├── firestore.rules
├── docs/
│   ├── راه‌اندازی-ابر.md
│   └── تحویل-به-مشتری.md
└── assets/covers/
```

## Deploy to Cloudflare Pages

1. Push repo to GitHub
2. Cloudflare → Pages → Connect Git
3. Build command: none
4. Output directory: `/`

## License

MIT
