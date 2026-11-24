import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, PanResponder, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { T, C } from '../theme';
import ShelfBook from './ShelfBook';
import { layoutShelves, sortBooks } from '../utils/layout';

export const ROWS = 3;
export const ROW_H = 124;
const SCALE = 0.8;
const FRAME = 10;
const HEAD = 34;
const PERSPECTIVE = 1500;

export const FACES = [
  { key: 'collection', title: 'Collection', sub: 'Everything you own' },
  { key: 'reading', title: 'Now reading', sub: 'Bookmarks in progress' },
  { key: 'favorites', title: 'Favorites', sub: 'Kept close at hand' },
  { key: 'loans', title: 'Loans', sub: 'Lent out & borrowed' },
];

export function faceSections(key, books) {
  const sorted = sortBooks(books, 'title');
  switch (key) {
    case 'collection': return [{ label: null, books: sorted.filter((b) => b.loan?.type !== 'borrowed'), rows: ROWS }];
    case 'reading': return [{ label: null, books: sorted.filter((b) => b.status === 'reading'), rows: ROWS }];
    case 'favorites': return [{ label: null, books: sorted.filter((b) => b.favorite), rows: ROWS }];
    default: return [
      { label: 'LENT OUT  ·  EMPTY SPOTS', books: sorted.filter((b) => b.loan?.type === 'lent'), rows: 1 },
      { label: 'BORROWED  ·  TAGGED', books: sorted.filter((b) => b.loan?.type === 'borrowed'), rows: 1 },
    ];
  }
}

export function caseFill(books, W) {
  const inner = W - FRAME * 2;
  const used = faceSections('collection', books)[0].books.reduce((a, b) => a + layoutShelves([b], { width: inner, scale: SCALE, rowH: ROW_H }).pos[b.id].w + 2, 0);
  return Math.min(1, used / (ROWS * (inner - 10)));
}

const FaceContent = React.memo(function FaceContent({ face, books, W, onOpen, openId, mounted }) {
  const inner = W - FRAME * 2;
  const sections = faceSections(face.key, books);
  let rowOffset = 0;
  let idx = 0;
  const items = [];
  const labels = [];
  let overflow = 0;
  sections.forEach((sec) => {
    const L = layoutShelves(sec.books, { width: inner, scale: SCALE, rowH: ROW_H, gap: 2, pad: 8, maxRows: sec.rows });
    if (sec.label) labels.push({ text: sec.label, row: rowOffset });
    overflow += L.overflow;
    sec.books.forEach((b) => {
      const p = L.pos[b.id];
      if (!p) return;
      items.push({ b, x: p.x, y: p.y + rowOffset * ROW_H, w: p.w, h: p.h, i: idx++ });
    });
    rowOffset += sec.rows;
  });
  const empty = items.length === 0;
  return (
    <View style={{ width: W, height: HEAD + ROWS * ROW_H + FRAME * 2 }}>
      <View style={s.frame}>
        <View style={s.cornice} />
        <View style={s.head}>
          <T style={s.headT}>{face.title.toUpperCase()}</T>
          <T style={s.headS}>{items.length} {items.length === 1 ? 'volume' : 'volumes'}</T>
        </View>
        <View style={{ marginHorizontal: FRAME, height: ROWS * ROW_H, backgroundColor: '#4E3829' }}>
          {Array.from({ length: ROWS }).map((_, r) => (
            <View key={r} style={[s.plank, { top: r * ROW_H + ROW_H - 8 }]} />
          ))}
          {labels.map((l) => (
            <T key={l.text} style={[s.rowLabel, { top: l.row * ROW_H + 3 }]}>{l.text}</T>
          ))}
          {items.map((it) => (
            <ShelfBook key={it.b.id} book={it.b} scale={SCALE} x={it.x} y={it.y} w={it.w} h={it.h}
              pulled={openId === it.b.id} onOpen={onOpen}
              enterDelay={mounted.current ? 0 : 120 + it.i * 55} />
          ))}
          {empty && (
            <View style={s.emptyBox}>
              <T style={{ color: 'rgba(242,230,208,0.75)', textAlign: 'center', fontSize: 13 }}>Lorem ipsum dolor sit amet, consectetur adipiscing.</T>
            </View>
          )}
          {overflow > 0 && <T style={s.more}>+{overflow} more</T>}
        </View>
      </View>
    </View>
  );
});

/**
 * A four-sided bookcase that rotates about its vertical axis. Each face is a
 * plane positioned with perspective + per-frame sin/cos interpolation, all on
 * the native driver.
 */
export default function Bookcase3D({ books, onOpen, openId, onFaceChange, controlRef }) {
  const { width } = useWindowDimensions();
  const W = Math.min(width - 84, 290);
  const R = W / 2;
  const FH = HEAD + ROWS * ROW_H + FRAME * 2;
  const f = useRef(new Animated.Value(0)).current;
  const fRef = useRef(0);
  const start = useRef(0);
  const [front, setFront] = useState(0);
  const frontRef = useRef(0);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; }, []);

  useEffect(() => {
    const id = f.addListener(({ value }) => {
      fRef.current = value;
      const n = ((Math.round(value) % 4) + 4) % 4;
      if (n !== frontRef.current) { frontRef.current = n; setFront(n); onFaceChange && onFaceChange(n); }
    });
    return () => f.removeListener(id);
  }, []);

  const settle = (target, vel = 0) => {
    Animated.spring(f, { toValue: target, friction: 9, tension: 38, velocity: vel, useNativeDriver: true }).start(({ finished }) => {
      if (!finished) return;
      const m = ((target % 4) + 4) % 4;
      f.setValue(m);
    });
  };

  useEffect(() => {
    if (controlRef) controlRef.current = {
      goTo: (idx) => {
        const cur = fRef.current;
        let d = ((idx - cur) % 4 + 4) % 4;
        if (d > 2) d -= 4;
        settle(cur + d);
      },
    };
  });

  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
    onPanResponderGrant: () => { f.stopAnimation((v) => { start.current = v; fRef.current = v; }); },
    onPanResponderMove: (_, g) => {
      f.setValue(Math.max(-1.6, Math.min(5.6, start.current - g.dx / 150)));
    },
    onPanResponderRelease: (_, g) => {
      const target = Math.round(fRef.current - g.vx * 0.5);
      settle(target);
    },
    onPanResponderTerminate: () => settle(Math.round(fRef.current)),
  }), []);

  // Pre-sampled trig tables so the rotation runs natively.
  const tables = useMemo(() => {
    const xs = [];
    for (let v = -2; v <= 6.0001; v += 1 / 12) xs.push(+v.toFixed(4));
    return FACES.map((_, i) => {
      const th = xs.map((v) => ((i - v) * 90 * Math.PI) / 180);
      const cos = th.map(Math.cos);
      const sc = cos.map((c) => PERSPECTIVE / (PERSPECTIVE - R * c));
      return {
        tx: { inputRange: xs, outputRange: th.map((t, k) => R * Math.sin(t) * sc[k]) },
        rot: { inputRange: xs, outputRange: xs.map((v) => `${(i - v) * 90}deg`) },
        sc: { inputRange: xs, outputRange: sc },
        op: { inputRange: xs, outputRange: cos.map((c) => (c > 0.04 ? 1 : 0)) },
        shade: { inputRange: xs, outputRange: cos.map((c) => (c > 0 ? Math.min(0.62, (1 - c) * 0.75) : 0.6)) },
      };
    });
  }, [R]);

  return (
    <View style={[{ height: FH * 1.11 + 50, alignItems: 'center' }, Platform.OS === 'web' && { touchAction: 'pan-y' }]} {...pan.panHandlers}>
      {/* floor + turntable */}
      <View style={[s.floor, { width: W - 30, bottom: 12 }]} />
      <View style={{ width, height: FH, position: 'absolute', top: FH * 0.055 + 14 }}>
        {FACES.map((face, i) => {
          const t = tables[i];
          return (
            <Animated.View
              key={face.key}
              pointerEvents={front === i ? 'auto' : 'none'}
              style={{
                position: 'absolute', left: (width - W) / 2, top: 0, width: W, height: FH,
                opacity: f.interpolate(t.op),
                zIndex: front === i ? 2 : 1,
                transform: [
                  { perspective: PERSPECTIVE },
                  { translateX: f.interpolate(t.tx) },
                  { scale: f.interpolate(t.sc) },
                  { rotateY: f.interpolate(t.rot) },
                ],
              }}
            >
              <FaceContent face={face} books={books} W={W} onOpen={onOpen} openId={openId} mounted={mounted} />
              <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#1c120a', opacity: f.interpolate(t.shade) }]} />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  frame: { flex: 1, backgroundColor: C.woodDark, borderRadius: 4, borderWidth: 1, borderColor: C.woodDeep, paddingBottom: FRAME, overflow: 'visible' },
  cornice: { position: 'absolute', top: -5, left: -5, right: -5, height: 9, backgroundColor: C.wood, borderRadius: 2, borderBottomWidth: 2, borderBottomColor: C.woodDeep },
  head: { height: HEAD, paddingHorizontal: FRAME + 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headT: { color: '#F0E2C6', letterSpacing: 4, fontSize: 12 },
  headS: { color: 'rgba(240,226,198,0.7)', fontSize: 11, letterSpacing: 1 },
  plank: { position: 'absolute', left: -FRAME, right: -FRAME, height: 8, backgroundColor: C.wood, borderTopWidth: 1, borderTopColor: C.woodLight, borderBottomWidth: 2, borderBottomColor: C.woodDeep },
  rowLabel: { position: 'absolute', right: 8, fontSize: 9, letterSpacing: 2.2, color: 'rgba(242,230,208,0.7)' },
  emptyBox: { position: 'absolute', left: 24, right: 24, top: 50 },
  more: { position: 'absolute', right: 6, bottom: 14, color: '#F0E2C6', fontSize: 11 },
  floor: { position: 'absolute', height: 10, borderRadius: 200, backgroundColor: 'rgba(74,54,39,0.14)' },
});
