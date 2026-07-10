export function makePlaceholderCover(title) {
  const words = title.split(/\s+/).filter(Boolean).slice(0, 3);
  const lines = words
    .map(
      (word, index) =>
        `<tspan x="100" dy="${index === 0 ? 0 : 22}">${escapeXml(word)}</tspan>`
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="200" height="300">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a5568"/>
      <stop offset="100%" stop-color="#718096"/>
    </linearGradient>
  </defs>
  <rect width="200" height="300" fill="url(#g)"/>
  <text x="100" y="140" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Tahoma, sans-serif" font-size="16" font-weight="600">${lines}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function makeBookId(title, author) {
  const base = `${title}-${author}`;
  let hash = 0;

  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }

  return `book-${Math.abs(hash).toString(36)}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
