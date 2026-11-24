import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Animated, Pressable, ScrollView, StyleSheet, PanResponder, KeyboardAvoidingView,
  Platform, Easing, useWindowDimensions,
} from 'react-native';
import { T, TI, C, isLight } from '../theme';
import { useLibrary } from '../store/LibraryContext';
import { Bar, Button, Eyebrow, Icon } from './ui';
import { fmtDate, daysBetween } from '../utils/layout';

const SLIP = 24;
const TABS = [
  { key: 'notes', label: 'Notes' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'characters', label: 'Cast' },
];
const STATUS = [
  { key: 'unread', label: 'To read' },
  { key: 'reading', label: 'Reading' },
  { key: 'read', label: 'Read' },
];

export default function BookPreview({ bookId, origin, onClose }) {
  const lib = useLibrary();
  const book = lib.books.find((b) => b.id === bookId);
  const { width, height } = useWindowDimensions();
  const Wc = width - 20;
  const Hc = Math.min(height - 130, 640);
  const half = Wc / 2;

  const [tab, setTab] = useState('notes');
  const [focusQuote, setFocusQuote] = useState(null);
  const flip = useRef(new Animated.Value(0)).current;
  const open = useRef(new Animated.Value(0)).current;
  const cover = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(open, { toValue: 1, duration: 460, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cover, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    Animated.sequence([
      Animated.timing(cover, { toValue: 0, duration: 320, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(open, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const turnTo = (key, quoteId = null) => {
    if (key === tab) { setFocusQuote(quoteId); return; }
    Animated.timing(flip, { toValue: 1, duration: 190, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
      setTab(key); setFocusQuote(quoteId);
      flip.setValue(-1);
      Animated.timing(flip, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    });
  };

  if (!book) return null;
  const ox = (origin?.x ?? width / 2) - width / 2;
  const oy = (origin?.y ?? height / 2) - height / 2;
  const light = isLight(book.color);

  const cardStyle = {
    width: Wc, height: Hc + SLIP,
    opacity: open.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 1] }),
    transform: [
      { translateX: open.interpolate({ inputRange: [0, 1], outputRange: [ox, 0] }) },
      { translateY: open.interpolate({ inputRange: [0, 1], outputRange: [oy, 0] }) },
      { scale: open.interpolate({ inputRange: [0, 1], outputRange: [0.12, 1] }) },
      // the closed book is only half the spread wide – re-centre as it opens
      { translateX: cover.interpolate({ inputRange: [0, 1], outputRange: [-half / 2, 0] }) },
    ],
  };

  const leftSide = {
    opacity: cover.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] }),
    transform: [
      { perspective: 1400 },
      { translateX: half / 2 },
      { rotateY: cover.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['90deg', '90deg', '0deg'] }) },
      { translateX: -half / 2 },
    ],
  };
  const coverStyle = {
    opacity: cover.interpolate({ inputRange: [0, 0.5, 0.51], outputRange: [1, 1, 0] }),
    transform: [
      { perspective: 1400 },
      { translateX: -half / 2 },
      { rotateY: cover.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-90deg', '-90deg'] }) },
      { translateX: half / 2 },
    ],
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(36,24,18,0.62)', opacity: open }]}>
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <KeyboardAvoidingView behavior="padding" style={styles.center} pointerEvents="box-none">
        <Animated.View style={cardStyle}>
          {/* ===== open spread ===== */}
          <View style={{ position: 'absolute', top: SLIP, left: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
            <Animated.View style={[{ width: half, height: Hc }, leftSide]}>
              <View style={[styles.coverHalf, { backgroundColor: book.color, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]} />
              <View style={[styles.stack, { left: 6, right: 0, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }]} />
              <View style={[styles.stack, { left: 9, right: 0, top: 10, bottom: 10, backgroundColor: C.pageShade, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }]} />
              <View style={[styles.page, { left: 12, right: 0, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }]}>
                <LeftPage book={book} lib={lib} w={half - 12} />
                <View style={styles.gutterL} pointerEvents="none" />
              </View>
            </Animated.View>
            <View style={{ width: half, height: Hc }}>
              <View style={[styles.coverHalf, { backgroundColor: book.color, borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} />
              <View style={[styles.stack, { right: 6, left: 0, borderTopRightRadius: 3, borderBottomRightRadius: 3 }]} />
              <View style={[styles.stack, { right: 9, left: 0, top: 10, bottom: 10, backgroundColor: C.pageShade, borderTopRightRadius: 3, borderBottomRightRadius: 3 }]} />
              <View style={[styles.page, { right: 12, left: 0, borderTopRightRadius: 3, borderBottomRightRadius: 3 }]}>
                <RightPage book={book} lib={lib} w={half - 12} tab={tab} flip={flip} turnTo={turnTo} focusQuote={focusQuote} />
                <View style={styles.gutterR} pointerEvents="none" />
              </View>
            </View>
          </View>

          {/* quotes tucked between the pages */}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: cover.interpolate({ inputRange: [0.8, 1], outputRange: [0, 1] }) }]} pointerEvents="box-none">
            {book.quotes.slice(0, 6).map((q, i, arr) => (
              <QuoteTab key={q.id} q={q} index={i} count={arr.length} left={half + 26} span={half - 64} active={tab === 'quotes' && focusQuote === q.id}
                onPress={() => turnTo('quotes', q.id)} delay={i * 70} />
            ))}
          </Animated.View>

          {/* closed cover */}
          <Animated.View pointerEvents="none" style={[styles.closedCover, { left: half, width: half, top: SLIP, height: Hc, backgroundColor: book.color }, coverStyle]}>
            <View style={[styles.coverFrame, { borderColor: light ? 'rgba(42,33,29,0.4)' : 'rgba(246,238,221,0.5)' }]}>
              <T style={{ fontSize: 11, letterSpacing: 3, color: light ? C.ink : '#F6EEDD', opacity: 0.8 }}>{book.genre.toUpperCase()}</T>
              <View style={{ height: 1, width: 30, backgroundColor: light ? C.ink : '#F6EEDD', opacity: 0.5, marginVertical: 16 }} />
              <T style={{ fontSize: 24, textAlign: 'center', color: light ? C.ink : '#F6EEDD', lineHeight: 30 }}>{book.title}</T>
              <T style={{ fontSize: 13, marginTop: 14, color: light ? C.ink : '#F6EEDD', opacity: 0.85 }}>{book.author}</T>
            </View>
          </Animated.View>

          <Animated.View style={{ position: 'absolute', left: 2, top: 0, opacity: cover }}>
            <Pressable onPress={close} hitSlop={10} style={styles.closeBtn}><Icon name="x" size={16} color={C.ink} /></Pressable>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ---------------- quote slips tucked in at the top edge ---------------- */
function QuoteTab({ q, index, count, left, span, active, onPress, delay }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: 1, delay: 700 + delay, friction: 6, tension: 80, useNativeDriver: true }).start();
  }, []);
  useEffect(() => {
    Animated.spring(a, { toValue: active ? 1.5 : 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, [active]);
  const x = left + (count === 1 ? span / 2 : (span * index) / (count - 1)) - 20;
  const tilt = ((index * 37) % 7) - 3;
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: 0, width: 40, height: SLIP + 14,
      transform: [
        { translateY: a.interpolate({ inputRange: [0, 1, 1.5], outputRange: [18, 2, -4] }) },
        { rotate: `${tilt}deg` },
      ],
    }}>
      <Pressable onPress={onPress} hitSlop={6} style={styles.slipTab}>
        <T style={{ fontSize: 10, color: C.burgundy, letterSpacing: 0.4 }}>p.{q.page}</T>
      </Pressable>
    </Animated.View>
  );
}

/* ---------------- left page: details, progress, loan ---------------- */
function LeftPage({ book, lib, w }) {
  const inner = w - 38;
  const [drag, setDrag] = useState(null);
  const [loanMode, setLoanMode] = useState(null);
  const [person, setPerson] = useState('');
  const pages = drag ?? book.pagesRead;
  const pct = book.pages ? pages / book.pages : 0;

  const spring = useRef(new Animated.Value(pct)).current;
  useEffect(() => { if (drag == null) Animated.spring(spring, { toValue: pct, friction: 8, tension: 70, useNativeDriver: false }).start(); else spring.setValue(pct); }, [pct, drag]);

  const start = useRef(0);
  const bookRef = useRef(book); bookRef.current = book;
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      const x = Math.max(0, Math.min(inner, e.nativeEvent.locationX));
      start.current = x;
      setDrag(Math.round((x / inner) * bookRef.current.pages));
    },
    onPanResponderMove: (_, g) => {
      const x = Math.max(0, Math.min(inner, start.current + g.dx));
      setDrag(Math.round((x / inner) * bookRef.current.pages));
    },
    onPanResponderRelease: (_, g) => {
      const x = Math.max(0, Math.min(inner, start.current + g.dx));
      lib.setProgress(bookRef.current.id, Math.round((x / inner) * bookRef.current.pages));
      setDrag(null);
    },
  }), [inner]);

  const left = book.target ? daysBetween(new Date(), book.target) : null;
  const perDay = left != null ? Math.ceil((book.pages - book.pagesRead) / Math.max(1, left)) : null;
  const loan = book.loan;

  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingRight: 24 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Eyebrow style={{ fontSize: 10 }}>{book.genre}</Eyebrow>
      <T style={{ fontSize: 22, lineHeight: 27, marginTop: 6, color: C.burgundyDeep }}>{book.title}</T>
      <T style={{ fontSize: 13, color: C.inkSoft, marginTop: 4 }}>{book.author}</T>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 5, marginTop: 14, alignItems: 'center' }}>
        {STATUS.map((s) => {
          const on = book.status === s.key;
          return (
            <Pressable key={s.key} onPress={() => lib.setStatus(book.id, s.key)}
              style={[styles.st, on && { backgroundColor: s.key === 'reading' ? C.green : C.burgundy, borderColor: 'transparent' }]}>
              <T style={{ fontSize: 11, color: on ? '#FBF3E2' : C.inkSoft }}>{s.label}</T>
            </Pressable>
          );
        })}
      </View>
      <Pressable onPress={() => lib.toggleFavorite(book.id)} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Icon name="heart" size={16} color={C.burgundy} fill={book.favorite ? C.burgundy : 'none'} />
        <T style={{ fontSize: 12, marginLeft: 6, color: C.inkSoft }}>{book.favorite ? 'In favorites' : 'Add to favorites'}</T>
      </Pressable>

      <View style={styles.rule} />
      <Eyebrow style={{ fontSize: 10 }}>Progress</Eyebrow>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
        <T style={{ fontSize: 28, color: C.green }}>{pages}</T>
        <T style={{ fontSize: 13, color: C.inkSoft }}> / {book.pages} pp</T>
      </View>

      {/* scrubber with a movable bookmark */}
      <View style={{ height: 58, marginTop: 8 }} {...pan.panHandlers}>
        <View style={{ position: 'absolute', top: 8, left: 0, width: inner }} pointerEvents="none">
          <Bar value={pct} color={C.green} h={4} />
        </View>
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 2, left: Animated.subtract(Animated.multiply(spring, inner), 7) }}>
          <View style={styles.ribbon}>
            <View style={styles.ribbonNotch} />
          </View>
        </Animated.View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -2 }}>
        <T style={{ fontSize: 12, color: C.inkSoft, flex: 1 }}>{Math.round(pct * 100)}%</T>
        <Pressable style={styles.step} onPress={() => lib.setProgress(book.id, book.pagesRead - 10, false)}><Icon name="minus" size={14} /></Pressable>
        <T style={{ fontSize: 11, marginHorizontal: 6, color: C.inkSoft }}>10 pp</T>
        <Pressable style={styles.step} onPress={() => lib.setProgress(book.id, book.pagesRead + 10)}><Icon name="plus" size={14} /></Pressable>
      </View>
      {book.status === 'reading' && left != null && (
        <T style={{ fontSize: 12, color: C.inkSoft, marginTop: 10, lineHeight: 17 }}>
          Finish by {fmtDate(book.target)} — about <T style={{ fontSize: 12, color: C.green }}>{perDay} pp</T> a day.
        </T>
      )}

      <View style={styles.rule} />
      <Eyebrow style={{ fontSize: 10 }}>Loan</Eyebrow>
      {loan ? (
        <View style={{ marginTop: 8 }}>
          <View style={[styles.loanCard, { borderColor: loan.type === 'lent' ? C.burgundy : C.green }]}>
            <T style={{ fontSize: 11, letterSpacing: 1.5, color: loan.type === 'lent' ? C.burgundy : C.green }}>{loan.type === 'lent' ? 'LENT TO' : 'BORROWED FROM'}</T>
            <T style={{ fontSize: 16, marginTop: 2 }}>{loan.person}</T>
            <T style={{ fontSize: 12, color: C.inkSoft, marginTop: 4 }}>Since {fmtDate(loan.date)} · due {fmtDate(loan.due)}</T>
          </View>
          <Button small kind="outline" tone={loan.type === 'lent' ? 'burgundy' : 'green'} label={loan.type === 'lent' ? 'Mark as returned' : 'Give back'} style={{ marginTop: 8 }} onPress={() => lib.returnLoan(book.id)} />
        </View>
      ) : loanMode ? (
        <View style={{ marginTop: 8 }}>
          <TI value={person} onChangeText={setPerson} placeholder={loanMode === 'lent' ? 'Lent to…' : 'Borrowed from…'} style={styles.input} />
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <Button small label="Confirm" onPress={() => { lib.lend(book.id, loanMode, person); setLoanMode(null); setPerson(''); }} />
            <Button small kind="outline" label="Cancel" style={{ marginLeft: 8 }} onPress={() => setLoanMode(null)} />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, marginTop: 8 }}>
          <Button small kind="outline" label="Lend out" onPress={() => setLoanMode('lent')} />
          <Button small kind="outline" tone="green" label="Borrowed" style={{ marginLeft: 8 }} onPress={() => setLoanMode('borrowed')} />
        </View>
      )}
      <View style={styles.rule} />
      <Eyebrow style={{ fontSize: 10 }}>About</Eyebrow>
      <T style={{ fontSize: 12.5, lineHeight: 18, color: C.inkSoft, marginTop: 6 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</T>
      <View style={{ height: 18 }} />
    </ScrollView>
  );
}

/* ---------------- right page: notes / quotes / cast ---------------- */
function RightPage({ book, lib, w, tab, flip, turnTo, focusQuote }) {
  const [text, setText] = useState('');
  const [extra, setExtra] = useState('');
  useEffect(() => { setText(''); setExtra(''); }, [tab]);

  const rot = flip.interpolate({ inputRange: [-1, 0, 1], outputRange: ['90deg', '0deg', '-90deg'] });
  const shade = flip.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.35, 0, 0.35] });

  const add = () => {
    if (!text.trim()) return;
    if (tab === 'notes') lib.addNote(book.id, text.trim());
    else if (tab === 'quotes') lib.addQuote(book.id, text.trim(), parseInt(extra, 10) || book.pagesRead || 1);
    else lib.addCharacter(book.id, text.trim(), extra.trim() || 'Lorem ipsum dolor sit amet.');
    setText(''); setExtra('');
  };

  const list = book[tab];
  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={{
        flex: 1, transform: [{ perspective: 1200 }, { translateX: -w / 2 }, { rotateY: rot }, { translateX: w / 2 }],
      }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingLeft: 18, paddingBottom: 8 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Eyebrow style={{ fontSize: 10 }}>{tab === 'notes' ? 'Reader’s notes' : tab === 'quotes' ? 'Saved quotes' : 'Key characters'}</Eyebrow>
          {list.length === 0 && <T style={{ fontSize: 13, color: C.inkSoft, marginTop: 10, lineHeight: 19 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</T>}
          {tab === 'notes' && list.map((n) => (
            <View key={n.id} style={styles.note}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T style={{ fontSize: 11, color: C.inkSoft, letterSpacing: 0.8 }}>{fmtDate(n.date)}</T>
                <Pressable hitSlop={8} onPress={() => lib.removeItem(book.id, 'notes', n.id)}><Icon name="x" size={12} color={C.inkFaint} /></Pressable>
              </View>
              <T style={{ fontSize: 13, lineHeight: 19, marginTop: 3 }}>{n.text}</T>
            </View>
          ))}
          {tab === 'quotes' && list.map((q, i) => <Slip key={q.id} q={q} i={i} focus={focusQuote === q.id} onDelete={() => lib.removeItem(book.id, 'quotes', q.id)} />)}
          {tab === 'characters' && list.map((c) => (
            <View key={c.id} style={styles.note}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T style={{ fontSize: 15, color: C.burgundyDeep }}>{c.name}</T>
                <Pressable hitSlop={8} onPress={() => lib.removeItem(book.id, 'characters', c.id)}><Icon name="x" size={12} color={C.inkFaint} /></Pressable>
              </View>
              <T style={{ fontSize: 12.5, lineHeight: 18, marginTop: 2, color: C.inkSoft }}>{c.desc}</T>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TI value={text} onChangeText={setText} multiline={tab !== 'characters'}
            placeholder={tab === 'notes' ? 'Write a note…' : tab === 'quotes' ? 'Tuck in a quote…' : 'Character name'} style={[styles.input, tab !== 'characters' && { minHeight: 40, maxHeight: 70 }]} />
          {tab !== 'notes' && (
            <TI value={extra} onChangeText={setExtra} keyboardType={tab === 'quotes' ? 'number-pad' : 'default'}
              placeholder={tab === 'quotes' ? 'Page number' : 'Who are they?'} style={[styles.input, { marginTop: 6 }]} />
          )}
          <Button small label={tab === 'quotes' ? 'Tuck in' : 'Add'} onPress={add} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
        </View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#3a2a1c', opacity: shade }]} />
      </Animated.View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => turnTo(t.key)} style={styles.tabBtn}>
            <T style={{ fontSize: 12, letterSpacing: 0.5, color: tab === t.key ? C.burgundy : C.inkFaint }}>{t.label}</T>
            <View style={{ height: 2, marginTop: 3, width: tab === t.key ? 18 : 0, backgroundColor: C.burgundy }} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Slip({ q, i, focus, onDelete }) {
  const a = useRef(new Animated.Value(focus ? 0 : 1)).current;
  useEffect(() => {
    if (focus) { a.setValue(0); Animated.spring(a, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start(); }
  }, [focus]);
  const tilt = ((i * 53) % 5) - 2;
  return (
    <Animated.View style={[styles.slip, focus && { borderColor: C.burgundy }, {
      transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }, { rotate: `${tilt * 0.5}deg` }],
      opacity: a.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    }]}>
      <View style={styles.slipTear} />
      <T style={{ fontSize: 13, lineHeight: 19, fontStyle: 'normal' }}>“{q.text}”</T>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <T style={{ fontSize: 11, letterSpacing: 1, color: C.burgundy }}>PAGE {q.page}</T>
        <Pressable hitSlop={8} onPress={onDelete}><Icon name="x" size={12} color={C.inkFaint} /></Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverHalf: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
  stack: { position: 'absolute', top: 6, bottom: 6, backgroundColor: '#E0D3B8', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.2)' },
  page: { position: 'absolute', top: 12, bottom: 12, backgroundColor: C.page, overflow: 'hidden' },
  gutterL: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 26, backgroundColor: 'rgba(90,60,30,0.12)' },
  gutterR: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, backgroundColor: 'rgba(90,60,30,0.13)' },
  closedCover: { position: 'absolute', borderRadius: 8, alignItems: 'center', justifyContent: 'center', padding: 14, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 12, elevation: 14 },
  coverFrame: { flex: 1, alignSelf: 'stretch', borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.page, alignItems: 'center', justifyContent: 'center', top: -6, left: -6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  st: { borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4, marginRight: 4 },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 14 },
  ribbon: { width: 14, height: 34, backgroundColor: C.burgundy, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 2, shadowOffset: { width: 1, height: 2 }, elevation: 3 },
  ribbonNotch: { position: 'absolute', bottom: 0, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderBottomWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: C.page },
  step: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  loanCard: { borderWidth: 1, borderLeftWidth: 3, borderRadius: 4, padding: 10, backgroundColor: 'rgba(255,255,255,0.5)' },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.6)', fontSize: 14 },
  note: { marginTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.line },
  slip: { marginTop: 14, padding: 12, backgroundColor: '#F6EBCF', borderWidth: 1, borderColor: 'rgba(184,146,63,0.35)', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  slipTear: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(184,146,63,0.35)' },
  slipTab: { flex: 1, backgroundColor: '#F6EBCF', borderWidth: 1, borderColor: 'rgba(184,146,63,0.55)', borderBottomWidth: 0, alignItems: 'center', paddingTop: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  composer: { paddingHorizontal: 14, paddingLeft: 18, paddingTop: 8, paddingBottom: 4, borderTopWidth: 1, borderTopColor: C.line },
  tabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, paddingLeft: 10, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.page },
  tabBtn: { alignItems: 'center', paddingHorizontal: 4 },
});
