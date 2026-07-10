import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const COVER_COLORS = {
  "crime-and-punishment": ["#4a3728", "#8b6914"],
  "war-and-peace": ["#2d4a3e", "#5c7a6b"],
  "madame-bovary": ["#6b4c6e", "#a67ba8"],
  "les-miserables": ["#3d4f6f", "#6b7fa3"],
  "the-metamorphosis": ["#4a4a4a", "#7a7a6e"],
  "one-hundred-years-of-solitude": ["#8b5a2b", "#c49a6c"],
  "pride-and-prejudice": ["#5c4a6b", "#9a8aaa"],
  "moby-dick": ["#1e3a5f", "#4a6fa5"],
  "the-stranger": ["#5c5c3d", "#8a8a5c"],
  "notes-from-underground": ["#3d2d2d", "#6b4a4a"],
  "don-quixote": ["#8b6914", "#c4a035"],
  "the-brothers-karamazov": ["#2d3d4f", "#5c6b7a"]
};

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function makeCover(id, title) {
  const [c1, c2] = COVER_COLORS[id] || ["#4a5568", "#718096"];
  const words = title.split(/\s+/).slice(0, 3);
  const lines = words
    .map((word, index) => `<tspan x="100" dy="${index === 0 ? 0 : 22}">${escapeXml(word)}</tspan>`)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <defs>
    <linearGradient id="g-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="300" fill="url(#g-${id})"/>
  <text x="100" y="140" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Tahoma, sans-serif" font-size="16" font-weight="600">${lines}</text>
</svg>`;
}

const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, "..");
const booksPath = join(root, "data", "books.json");
const outDir = join(root, "assets", "covers");

mkdirSync(outDir, { recursive: true });

const books = JSON.parse(readFileSync(booksPath, "utf8"));
let created = 0;

for (const book of books) {
  const coverPath = join(root, book.cover);
  if (!existsSync(coverPath)) {
    writeFileSync(coverPath, makeCover(book.id, book.title));
    created++;
  }
}

console.log(`Checked ${books.length} books. Generated ${created} new cover(s).`);
