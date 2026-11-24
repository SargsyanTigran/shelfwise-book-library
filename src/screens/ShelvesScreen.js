import React, { useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { T, C } from '../theme';
import { useLibrary } from '../store/LibraryContext';
import { Chip, Segmented, Eyebrow } from '../components/ui';
import ShelfBook from '../components/ShelfBook';
import { SORTS, sortBooks, layoutShelves } from '../utils/layout';

export const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'reading', label: 'Reading', test: (b) => b.status === 'reading' },
  { key: 'read', label: 'Read', test: (b) => b.status === 'read' },
  { key: 'fav', label: 'Favorites', test: (b) => b.favorite },
  { key: 'lent', label: 'Lent out', test: (b) => b.loan?.type === 'lent' },
  { key: 'borrowed', label: 'Borrowed', test: (b) => b.loan?.type === 'borrowed' },
];

const ROW_H = 164;

export default function ShelvesScreen({ onOpen, openId, bottomPad }) {
  const { books } = useLibrary();
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('title');
  const cache = useRef({});

  const caseW = width - 32;
  const innerW = caseW - 20;
  const test = FILTERS.find((f) => f.key === filter).test;
  const sorted = useMemo(() => sortBooks(books, sort), [books, sort]);
  const shown = useMemo(() => sorted.filter(test), [sorted, filter]);

  const { pos, rows, labels } = useMemo(
    () => layoutShelves(shown, { width: innerW, scale: 1, rowH: ROW_H, gap: 3, breakOnGenre: sort === 'genre', pad: 8 }),
    [shown, innerW, sort]
  );
  Object.keys(pos).forEach((id) => { if (pos[id]) cache.current[id] = pos[id]; });
  const nRows = Math.max(rows, 2);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
      <View style={s.head}>
        <Eyebrow>Reading room</Eyebrow>
        <T style={s.title}>Your shelves</T>
        <T style={s.lede}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</T>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}>
        {FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)}
            count={books.filter(f.test).length} tone={f.key === 'reading' || f.key === 'borrowed' ? 'green' : 'burgundy'} />
        ))}
      </ScrollView>

      <View style={s.sortRow}>
        <Eyebrow>Arrange by</Eyebrow>
        <Segmented options={SORTS} value={sort} onChange={setSort} />
      </View>

      <View style={[s.case, { width: caseW, marginHorizontal: 16 }]}>
        <View style={[s.back, { height: nRows * ROW_H + 6 }]}>
          {Array.from({ length: nRows }).map((_, r) => (
            <View key={r} style={[s.plank, { top: r * ROW_H + ROW_H - 10 }]}>
              <View style={s.plankTop} />
            </View>
          ))}
          {labels.map((l) => (
            <T key={l.row + l.text} style={[s.label, { top: l.row * ROW_H + 4 }]}>{l.text.toUpperCase()}</T>
          ))}
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
            {sorted.map((b) => {
              const p = pos[b.id] || cache.current[b.id] || { x: 0, y: 0, w: 24, h: 120 };
              return (
                <ShelfBook key={b.id} book={b} x={p.x} y={p.y} w={p.w} h={p.h}
                  visible={!!pos[b.id]} pulled={openId === b.id} onOpen={onOpen}
                  enterDelay={b.fresh ? 0 : null} />
              );
            })}
          </View>
        </View>
        {shown.length === 0 && (
          <View style={s.empty}>
            <T style={{ color: '#F2E6D0', textAlign: 'center', fontSize: 14 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</T>
          </View>
        )}
      </View>

      <View style={s.legend}>
        <Legend kind="reading" text="Currently reading" />
        <Legend kind="fav" text="Favorite" />
        <Legend kind="lent" text="Lent out" />
        <Legend kind="borrowed" text="Borrowed" />
      </View>
    </ScrollView>
  );
}

function Legend({ kind, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 6 }}>
      {kind === 'reading' && <View style={{ width: 6, height: 11, backgroundColor: C.green }} />}
      {kind === 'fav' && <View style={{ width: 7, height: 7, backgroundColor: C.gold, transform: [{ rotate: '45deg' }] }} />}
      {kind === 'lent' && <View style={{ width: 10, height: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: C.inkSoft }} />}
      {kind === 'borrowed' && <View style={{ width: 12, height: 9, borderWidth: 1, borderColor: C.burgundy, backgroundColor: '#F3E7CC' }} />}
      <T style={{ fontSize: 12, marginLeft: 7, color: C.inkSoft }}>{text}</T>
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  title: { fontSize: 34, marginTop: 2, color: C.burgundyDeep, letterSpacing: 0.3 },
  lede: { fontSize: 14, color: C.inkSoft, marginTop: 2 },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  case: { backgroundColor: C.woodDark, borderRadius: 6, padding: 10, borderWidth: 1, borderColor: C.woodDeep, shadowColor: '#2b1c10', shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  back: { backgroundColor: '#563F2E', overflow: 'visible', borderRadius: 2 },
  plank: { position: 'absolute', left: -10, right: -10, height: 10, backgroundColor: C.wood, borderTopWidth: 1, borderTopColor: C.woodLight, borderBottomWidth: 2, borderBottomColor: C.woodDeep },
  plankTop: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: 'rgba(255,255,255,0.16)' },
  label: { position: 'absolute', right: 10, fontSize: 10, letterSpacing: 2.5, color: 'rgba(242,230,208,0.6)', zIndex: 0 },
  empty: { position: 'absolute', left: 30, right: 30, top: 80 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingTop: 18 },
});
