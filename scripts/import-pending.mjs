import { readFileSync, readdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import { resolveColumn } from "./lookup-maps.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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

function hasBookRows(filePath) {
  if (!existsSync(filePath)) return false;

  const rows = parseCsv(readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
  if (rows.length < 2) return false;

  const columns = rows[0].map((header) => resolveColumn(header));
  const titleIndex = columns.indexOf("title");
  const authorIndex = columns.indexOf("author");
  if (titleIndex === -1 || authorIndex === -1) return false;

  return rows.slice(1).some((row) => {
    const title = (row[titleIndex] ?? "").trim();
    const author = (row[authorIndex] ?? "").trim();
    return title && author;
  });
}

function collectImportFiles() {
  const files = [];
  const primary = join(root, "data", "new-books.csv");

  if (hasBookRows(primary)) {
    files.push(primary);
  }

  const importsDir = join(root, "data", "imports");
  if (existsSync(importsDir)) {
    for (const name of readdirSync(importsDir).sort()) {
      if (!name.endsWith(".csv")) continue;
      const filePath = join(importsDir, name);
      if (hasBookRows(filePath)) files.push(filePath);
    }
  }

  return files;
}

const files = collectImportFiles();

if (!files.length) {
  console.log("No CSV files with book data found. Skipping import.");
  process.exit(0);
}

for (const file of files) {
  console.log("Importing:", file.replace(root + "/", "").replace(root + "\\", ""));
  const result = spawnSync(
    process.execPath,
    [join(root, "scripts", "import-from-csv.mjs"), file, "--covers"],
    { cwd: root, stdio: "inherit" }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Import complete.");
