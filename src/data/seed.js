// Simulated "imported" library: books, notes, quotes and characters.
const DAY = 86400000;
const ago = (d) => new Date(Date.now() - d * DAY).toISOString();
const ahead = (d) => new Date(Date.now() + d * DAY).toISOString();

const L = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit.',
];
const Q = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
];
const CH = [
  ['Lorem Ipsum', 'Dolor sit amet, consectetur adipiscing elit sed do.'],
  ['Amet Consectetur', 'Eiusmod tempor incididunt ut labore et dolore.'],
  ['Adipiscing Elit', 'Magna aliqua ut enim ad minim veniam quis.'],
  ['Tempor Incidunt', 'Nostrud exercitation ullamco laboris nisi ut.'],
];

let uid = 0;
const notes = (n, d) => Array.from({ length: n }, (_, i) => ({ id: `n${++uid}`, text: L[(i + d) % L.length], date: ago(d + i * 3) }));
const quotes = (n, d, pages) => Array.from({ length: n }, (_, i) => ({ id: `q${++uid}`, text: Q[(i + d) % Q.length], page: Math.max(4, Math.round((pages * (i + 1)) / (n + 1) / 2) + d * 3) }));
const chars = (n, d) => Array.from({ length: n }, (_, i) => ({ id: `c${++uid}`, name: CH[(i + d) % CH.length][0], desc: CH[(i + d) % CH.length][1] }));

// look: [color, height(0..1), widthBoost]
const B = (id, title, author, genre, pages, status, read, fav, color, h, w, extra = {}) => ({
  id, title, author, genre, pages,
  status, // 'unread' | 'reading' | 'read'
  pagesRead: status === 'read' ? pages : read,
  favorite: fav,
  color, h, w,
  loan: null,
  notes: status === 'unread' ? [] : notes(status === 'reading' ? 2 : 1, id.length),
  quotes: status === 'unread' ? [] : quotes(extra.q ?? 2, id.length, pages),
  characters: status === 'unread' ? [] : chars(extra.c ?? 3, id.length),
  target: status === 'reading' ? ahead(extra.t ?? 14) : null,
  addedAt: ago(extra.added ?? 30),
  ...extra.rest,
});

export const SEED_BOOKS = [
  B('b1', 'The Salt Orchard', 'Imogen Hale', 'Fiction', 312, 'read', 0, true, '#7B2433', 0.92, 1, { q: 3 }),
  B('b2', 'A Lantern for Winter', 'Tobias Rennick', 'Fantasy', 428, 'reading', 142, false, '#3E5C48', 1, 1.1, { q: 3, t: 18 }),
  B('b3', 'Cartography of Rain', 'Saoirse Whitlock', 'Poetry', 96, 'read', 0, true, '#D9C9A6', 0.72, 0.7, { q: 2 }),
  B('b4', 'The Quiet Engine', 'Dmitri Valcourt', 'Science', 264, 'reading', 201, false, '#3B4A5A', 0.95, 0.95, { t: 6 }),
  B('b5', 'Letters from Low Tide', 'Anneli Broch', 'Fiction', 288, 'unread', 0, false, '#C28B86', 0.85, 0.95),
  B('b6', 'Ninefold Harbour', 'Corin Ashdown', 'Mystery', 356, 'read', 0, false, '#3A3330', 1, 1.05),
  B('b7', 'Gardens of the Lost Empire', 'Helena Marsh', 'History', 512, 'unread', 0, false, '#B5823A', 1, 1.3),
  B('b8', 'Small Mercies', 'Odalys Pryce', 'Essays', 184, 'read', 0, true, '#8FA58A', 0.78, 0.8, { q: 4 }),
  B('b9', "The Clockmaker's Apprentice", 'Wren Castellan', 'Fantasy', 402, 'read', 0, false, '#5B3A4E', 0.97, 1.1),
  B('b10', 'Understory', 'Felix Anand', 'Science', 336, 'read', 0, false, '#56706C', 0.9, 1),
  B('b11', 'Thistle & Bone', 'Maeve Dunmore', 'Mystery', 274, 'unread', 0, false, '#A4593F', 0.88, 0.9),
  B('b12', 'The Last Ferry to Orsa', 'Bastien Leroy', 'Fiction', 298, 'reading', 40, false, '#7B2433', 0.82, 0.95, { t: 10 }),
  B('b13', 'Salt Roads', 'Nadia Osei', 'History', 448, 'read', 0, false, '#3E5C48', 0.98, 1.15),
  B('b14', 'Evenings in Amber', 'Calla Mirren', 'Poetry', 112, 'read', 0, true, '#B5823A', 0.7, 0.7),
  B('b15', 'Moth Season', 'Ilya Ferrante', 'Mystery', 320, 'unread', 0, false, '#3B4A5A', 0.92, 1),
  B('b16', 'What the River Keeps', 'Rowan Tide', 'Fiction', 380, 'read', 0, false, '#D9C9A6', 0.95, 1.05),
  B('b17', 'An Atlas of Small Hours', 'Lucia Verne', 'Essays', 220, 'unread', 0, false, '#A4593F', 0.8, 0.85),
  B('b18', 'The Glass Almanac', 'Hugo Pell', 'Science', 296, 'read', 0, true, '#5B3A4E', 0.86, 0.95),
  B('b19', 'Kingfisher Court', 'Beatrix Lowe', 'Fiction', 344, 'read', 0, false, '#8FA58A', 0.93, 1),
].map((b) => {
  if (b.id === 'b9') b.loan = { type: 'lent', person: 'Marta Ipsum', date: ago(12), due: ahead(9) };
  if (b.id === 'b10') b.loan = { type: 'lent', person: 'Joon Dolor', date: ago(34), due: ago(4) };
  if (b.id === 'b19') b.loan = { type: 'lent', person: 'Elio Amet', date: ago(3), due: ahead(25) };
  if (b.id === 'b11') b.loan = { type: 'borrowed', person: 'Priya Sit', date: ago(6), due: ahead(15) };
  if (b.id === 'b12') b.loan = { type: 'borrowed', person: 'Tomas Elit', date: ago(9), due: ahead(10) };
  return b;
});

// Pool used by the "Import" button (simulated import from a scan / CSV).
export const IMPORT_POOL = [
  ['Harbour Lights, Slowly', 'Elsbeth Crane', 'Fiction', 268],
  ['The Beekeeper’s Almanac', 'Orlan Fitch', 'Essays', 204],
  ['Vesper & the Paper Moon', 'Isidore Vane', 'Fantasy', 390],
  ['A Field Guide to Silence', 'Noor Halden', 'Science', 242],
  ['The Winter Ledger', 'Mirela Stroud', 'Mystery', 330],
  ['Ashes of the Quiet Kings', 'Tamsin Oakes', 'History', 470],
  ['Small Hours, Lit', 'Pia Marchetti', 'Poetry', 88],
];

// Pages read on each of the past six days (today's is added live).
export const SEED_LOG = (() => {
  const out = {};
  const vals = [22, 35, 0, 48, 36, 41];
  vals.forEach((v, i) => { out[dayKey(new Date(Date.now() - (6 - i) * DAY))] = v; });
  out[dayKey(new Date())] = 12;
  return out;
})();

export function dayKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
