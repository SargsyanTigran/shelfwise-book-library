// Shared shelf layout maths used by both the flat shelves and the 3D case.
export const SORTS = [
  { key: 'title', label: 'A – Z' },
  { key: 'genre', label: 'Genre' },
  { key: 'author', label: 'Author' },
];

const lastName = (a) => a.trim().split(/\s+/).slice(-1)[0].toLowerCase();
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const stripThe = (t) => t.toLowerCase().replace(/^(the|a|an)\s+/, '');

export function sortBooks(books, key) {
  const arr = [...books];
  arr.sort((a, b) => {
    if (key === 'genre') return cmp(a.genre, b.genre) || cmp(stripThe(a.title), stripThe(b.title));
    if (key === 'author') return cmp(lastName(a.author), lastName(b.author)) || cmp(stripThe(a.title), stripThe(b.title));
    return cmp(stripThe(a.title), stripThe(b.title));
  });
  return arr;
}

export function spineSize(b, s = 1) {
  const w = Math.max(20, Math.min(40, (20 + ((b.pages - 150) / 300) * 12) * (b.w || 1)));
  const h = 100 + 34 * (b.h ?? 0.9);
  return { w: Math.round(w * s), h: Math.round(h * s) };
}

/**
 * Flow books into rows. Returns { pos: {id: {x,y,w,h,row}}, rows, labels:[{row,text}] }
 * y is the TOP of the book so that the bottoms rest on the shelf plank.
 */
export function layoutShelves(books, { width, scale = 1, rowH, gap = 2, breakOnGenre = false, pad = 10, maxRows = Infinity }) {
  const pos = {};
  const labels = [];
  let row = 0, x = pad, lastGenre = null, overflow = 0;
  const inner = width - pad;
  books.forEach((b) => {
    const { w, h } = spineSize(b, scale);
    const newGenre = breakOnGenre && lastGenre !== null && b.genre !== lastGenre;
    if (x > pad && (x + w > inner || newGenre)) { row += 1; x = pad; }
    if (breakOnGenre && b.genre !== lastGenre) labels.push({ row, text: b.genre });
    lastGenre = b.genre;
    if (row >= maxRows) { overflow += 1; pos[b.id] = null; return; }
    pos[b.id] = { x, y: row * rowH + (rowH - h - 10), w, h, row };
    x += w + gap;
  });
  return { pos, rows: Math.min(row + 1, maxRows), labels, overflow };
}

export const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
export const daysBetween = (a, b) => Math.ceil((new Date(b) - new Date(a)) / 86400000);
