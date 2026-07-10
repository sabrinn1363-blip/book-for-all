import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import {
  resolveColumn,
  resolveLookup,
  countryReverse,
  genreReverse,
  schoolReverse,
  periodReverse
} from "./lookup-maps.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const defaultOutput = join(root, "data", "books.json");

function parseArgs(argv) {
  const args = { merge: true, covers: false, output: defaultOutput, input: null };
  for (const arg of argv) {
    if (arg === "--replace") args.merge = false;
    else if (arg === "--covers") args.covers = true;
    else if (arg.startsWith("--output=")) args.output = resolve(arg.slice(9));
    else if (!arg.startsWith("-")) args.input = resolve(arg);
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  return rows;
}

function makeId(title, author) {
  const base = `${title}-${author}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return `book-${Math.abs(hash).toString(36)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function rowToBook(rawRow, columns) {
  const data = {};
  for (let i = 0; i < columns.length; i++) {
    const field = columns[i];
    if (!field) continue;
    data[field] = (rawRow[i] ?? "").trim();
  }

  if (!data.title || !data.author) {
    return null;
  }

  const id = data.id || makeId(data.title, data.author);
  const tags = data.tags
    ? data.tags.split(/[،,|]/).map((tag) => tag.trim()).filter(Boolean)
    : [];

  return {
    id,
    title: data.title,
    author: data.author,
    translator: data.translator || "—",
    publisher: data.publisher || "—",
    year: Number(data.year) || new Date().getFullYear(),
    country: resolveLookup(data.country, countryReverse, "country"),
    genre: resolveLookup(data.genre, genreReverse, "genre"),
    literarySchool: resolveLookup(data.literarySchool, schoolReverse, "school"),
    historicalPeriod: resolveLookup(
      data.historicalPeriod,
      periodReverse,
      "period"
    ),
    pages: Number(data.pages) || 0,
    summary: data.summary || "",
    review: data.review || "",
    tags,
    cover: data.cover || `assets/covers/${id}.svg`,
    addedAt: data.addedAt || today()
  };
}

function mergeBooks(existing, incoming) {
  const byId = new Map(existing.map((book) => [book.id, book]));
  for (const book of incoming) {
    byId.set(book.id, book);
  }
  return [...byId.values()].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

function printHelp() {
  console.log(`Usage:
  node scripts/import-from-csv.mjs <file.csv> [--merge|--replace] [--covers]

Options:
  --merge     Update existing books by id and add new ones (default)
  --replace   Replace books.json with only CSV rows
  --covers    Generate missing SVG covers after import
  --output=   Custom output path (default: data/books.json)

Examples:
  node scripts/import-from-csv.mjs data/new-books.csv
  node scripts/import-from-csv.mjs data/new-books.csv --covers
`);
}

const args = parseArgs(process.argv.slice(2));

if (!args.input) {
  printHelp();
  process.exit(1);
}

if (!existsSync(args.input)) {
  console.error("File not found:", args.input);
  process.exit(1);
}

const raw = readFileSync(args.input, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(raw);

if (!rows.length) {
  console.error("CSV file is empty.");
  process.exit(1);
}

const headers = rows[0].map((header) => resolveColumn(header));
const unknownHeaders = rows[0].filter((header, index) => !headers[index]);

if (unknownHeaders.length) {
  console.warn("Ignored columns:", unknownHeaders.join(", "));
}

const imported = [];
for (const rawRow of rows.slice(1)) {
  const book = rowToBook(rawRow, headers);
  if (book) imported.push(book);
}

if (!imported.length) {
  console.error("No valid book rows found. Each row needs at least title and author.");
  process.exit(1);
}

let books = imported;

if (args.merge && existsSync(args.output)) {
  const existing = JSON.parse(readFileSync(args.output, "utf8"));
  books = mergeBooks(existing, imported);
}

writeFileSync(args.output, `${JSON.stringify(books, null, 2)}\n`, "utf8");

console.log(`Imported ${imported.length} row(s). Total books: ${books.length}`);
console.log("Saved to:", args.output);

if (args.covers) {
  const result = spawnSync(process.execPath, ["scripts/generate-covers.mjs"], {
    cwd: root,
    stdio: "inherit"
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
