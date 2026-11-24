import React, { useRef, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { T, C } from '../theme';
import { useLibrary } from '../store/LibraryContext';
import Bookcase3D, { FACES, caseFill } from '../components/Bookcase3D';
import { Chip, Eyebrow, Bar, Button, Icon } from '../components/ui';
import { fmtDate, daysBetween } from '../utils/layout';
import { useWindowDimensions } from 'react-native';

export default function LibraryScreen({ onOpen, openId, bottomPad }) {
  const { books, returnLoan } = useLibrary();
  const { width } = useWindowDimensions();
  const [face, setFace] = useState(0);
  const ctl = useRef(null);
  const fill = useMemo(() => caseFill(books, Math.min(width - 84, 290)), [books, width]);
  const lent = books.filter((b) => b.loan?.type === 'lent');
  const borrowed = books.filter((b) => b.loan?.type === 'borrowed');

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
      <View style={s.head}>
        <Eyebrow>The rotating case</Eyebrow>
        <T style={s.title}>Library</T>
        <T style={s.lede}>Drag sideways to turn the bookcase. Lorem ipsum dolor sit amet.</T>
      </View>

      <Bookcase3D books={books} onOpen={onOpen} openId={openId} onFaceChange={setFace} controlRef={ctl} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6 }}>
        {FACES.map((f, i) => (
          <Chip key={f.key} label={f.title} active={face === i} onPress={() => ctl.current && ctl.current.goTo(i)} tone={i === 1 || i === 3 ? 'green' : 'burgundy'} />
        ))}
      </ScrollView>

      <View style={s.fillBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Eyebrow>Case filled</Eyebrow>
          <T style={{ fontSize: 13, color: C.inkSoft }}>{Math.round(fill * 100)}% · {books.length} volumes</T>
        </View>
        <Bar value={fill} color={C.burgundy} h={5} />
        <T style={{ fontSize: 13, color: C.inkSoft, marginTop: 10 }}>{FACES[face].sub}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</T>
      </View>

      {face === 3 && (
        <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
          <Ledger title="Lent out" note="Their spots stay empty on the shelf" tone={C.burgundy} items={lent} onReturn={returnLoan} onOpen={onOpen} />
          <Ledger title="Borrowed" note="Tagged with a hanging label" tone={C.green} items={borrowed} onReturn={returnLoan} onOpen={onOpen} />
        </View>
      )}
    </ScrollView>
  );
}

function Ledger({ title, note, tone, items, onReturn, onOpen }) {
  return (
    <View style={{ marginTop: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T style={{ fontSize: 20, color: tone }}>{title}</T>
        <T style={{ fontSize: 12, color: C.inkSoft }}>{note}</T>
      </View>
      <View style={{ height: 1, backgroundColor: tone, opacity: 0.4, marginTop: 6 }} />
      {items.length === 0 && <T style={{ fontSize: 13, color: C.inkSoft, paddingVertical: 14 }}>Lorem ipsum dolor sit amet.</T>}
      {items.map((b) => {
        const late = daysBetween(new Date(), b.loan.due) < 0;
        return (
          <Pressable key={b.id} onPress={(e) => onOpen(b, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })} style={s.row}>
            <View style={{ width: 8, height: 44, backgroundColor: b.color, borderRadius: 1, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <T style={{ fontSize: 15 }} numberOfLines={1}>{b.title}</T>
              <T style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 1 }}>
                {b.loan.type === 'lent' ? 'to ' : 'from '}{b.loan.person} · <T style={{ fontSize: 12.5, color: late ? C.burgundy : C.inkSoft }}>{late ? 'overdue since ' : 'due '}{fmtDate(b.loan.due)}</T>
              </T>
            </View>
            <Button small kind="outline" tone={b.loan.type === 'lent' ? 'burgundy' : 'green'} label={b.loan.type === 'lent' ? 'Returned' : 'Give back'} onPress={() => onReturn(b.id)} />
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 10 },
  title: { fontSize: 34, marginTop: 2, color: C.burgundyDeep, letterSpacing: 0.3 },
  lede: { fontSize: 14, color: C.inkSoft, marginTop: 2 },
  fillBox: { marginHorizontal: 20, marginTop: 18, padding: 16, borderRadius: 10, backgroundColor: C.page, borderWidth: 1, borderColor: C.line },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
});
