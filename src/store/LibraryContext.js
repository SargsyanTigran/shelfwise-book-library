import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_BOOKS, SEED_LOG, IMPORT_POOL, dayKey } from '../data/seed';
import { SPINE_COLORS } from '../theme';

const KEY = 'shelfwise.v1';
const Ctx = createContext(null);
export const useLibrary = () => useContext(Ctx);

const initial = { books: SEED_BOOKS, log: SEED_LOG, dailyGoal: 30 };
const rid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function patch(state, id, fn) {
  return { ...state, books: state.books.map((b) => (b.id === id ? fn(b) : b)) };
}

function reducer(state, a) {
  switch (a.type) {
    case 'hydrate': return { ...a.state, books: a.state.books.map((b) => ({ ...b, fresh: false })) };
    case 'add': return { ...state, books: [...state.books, a.book] };
    case 'status':
      return patch(state, a.id, (b) => ({
        ...b,
        status: a.status,
        pagesRead: a.status === 'read' ? b.pages : a.status === 'unread' ? 0 : b.pagesRead,
        target: a.status === 'reading' ? b.target || new Date(Date.now() + 14 * 86400000).toISOString() : null,
      }));
    case 'fav': return patch(state, a.id, (b) => ({ ...b, favorite: !b.favorite }));
    case 'progress': {
      const b0 = state.books.find((b) => b.id === a.id);
      const pages = Math.max(0, Math.min(b0.pages, Math.round(a.pages)));
      const delta = pages - b0.pagesRead;
      const k = dayKey(new Date());
      const log = delta > 0 && a.log !== false ? { ...state.log, [k]: (state.log[k] || 0) + delta } : state.log;
      const s = patch(state, a.id, (b) => ({
        ...b,
        pagesRead: pages,
        status: pages >= b.pages ? 'read' : pages > 0 ? 'reading' : b.status === 'read' ? 'reading' : b.status,
        target: pages >= b.pages ? null : b.target || new Date(Date.now() + 14 * 86400000).toISOString(),
      }));
      return { ...s, log };
    }
    case 'target': return patch(state, a.id, (b) => ({ ...b, target: a.target }));
    case 'loan': return patch(state, a.id, (b) => ({ ...b, loan: a.loan }));
    case 'addItem': return patch(state, a.id, (b) => ({ ...b, [a.key]: [a.item, ...b[a.key]] }));
    case 'delItem': return patch(state, a.id, (b) => ({ ...b, [a.key]: b[a.key].filter((x) => x.id !== a.itemId) }));
    case 'goal': return { ...state, dailyGoal: Math.max(5, a.goal) };
    default: return state;
  }
}

export function LibraryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => { if (s) dispatch({ type: 'hydrate', state: JSON.parse(s) }); })
      .catch(() => {})
      .finally(() => { loaded.current = true; setReady(true); });
  }, []);
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const api = useMemo(() => ({
    addBook: ({ title, author, genre, pages, status }) => {
      const book = {
        id: rid('b'), title: title.trim(), author: author.trim(), genre, pages,
        status, pagesRead: status === 'read' ? pages : 0, favorite: false,
        color: SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)],
        h: 0.75 + Math.random() * 0.25, w: 0.75 + Math.random() * 0.4,
        loan: null, notes: [], quotes: [], characters: [],
        target: status === 'reading' ? new Date(Date.now() + 14 * 86400000).toISOString() : null,
        addedAt: new Date().toISOString(), fresh: true,
      };
      dispatch({ type: 'add', book });
      return book;
    },
    importSample: () => {
      const have = new Set(state.books.map((b) => b.title));
      const pick = IMPORT_POOL.find((p) => !have.has(p[0])) || IMPORT_POOL[Math.floor(Math.random() * IMPORT_POOL.length)];
      return api.addBook({ title: pick[0], author: pick[1], genre: pick[2], pages: pick[3], status: 'unread' });
    },
    setStatus: (id, status) => dispatch({ type: 'status', id, status }),
    toggleFavorite: (id) => dispatch({ type: 'fav', id }),
    setProgress: (id, pages, log) => dispatch({ type: 'progress', id, pages, log }),
    setTarget: (id, target) => dispatch({ type: 'target', id, target }),
    lend: (id, type, person, days = 21) =>
      dispatch({ type: 'loan', id, loan: { type, person: person.trim() || 'Lorem Ipsum', date: new Date().toISOString(), due: new Date(Date.now() + days * 86400000).toISOString() } }),
    returnLoan: (id) => dispatch({ type: 'loan', id, loan: null }),
    addNote: (id, text) => dispatch({ type: 'addItem', id, key: 'notes', item: { id: rid('n'), text, date: new Date().toISOString() } }),
    addQuote: (id, text, page) => dispatch({ type: 'addItem', id, key: 'quotes', item: { id: rid('q'), text, page } }),
    addCharacter: (id, name, desc) => dispatch({ type: 'addItem', id, key: 'characters', item: { id: rid('c'), name, desc } }),
    removeItem: (id, key, itemId) => dispatch({ type: 'delItem', id, key, itemId }),
    setDailyGoal: (g) => dispatch({ type: 'goal', goal: g }),
  }), [state.books]);

  const value = useMemo(() => ({ ...state, ...api, ready }), [state, api, ready]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
