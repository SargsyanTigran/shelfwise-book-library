import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { T, C } from '../theme';
import { useLibrary } from '../store/LibraryContext';
import { dayKey } from '../data/seed';
import { Eyebrow, Bar, Button, Icon } from '../components/ui';
import { fmtDate, daysBetween } from '../utils/layout';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function ScheduleScreen({ onOpen, bottomPad }) {
  const { books, log, dailyGoal, setDailyGoal, setProgress, setTarget } = useLibrary();
  const reading = books.filter((b) => b.status === 'reading');
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { d, v: log[dayKey(d)] || 0 };
  });
  const today = week[6].v;
  const max = Math.max(dailyGoal * 1.4, ...week.map((w) => w.v));
  let streak = 0;
  for (let i = 6; i >= 0; i--) { if (week[i].v >= dailyGoal) streak++; else if (i !== 6) break; }
  const total = week.reduce((a, w) => a + w.v, 0);

  const R = 46, CIR = 2 * Math.PI * R;
  const p = Math.min(1, today / dailyGoal);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
      <View style={s.head}>
        <Eyebrow>Reading schedule</Eyebrow>
        <T style={s.title}>This week</T>
        <T style={s.lede}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</T>
      </View>

      <View style={s.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 112, height: 112, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={112} height={112} viewBox="0 0 112 112">
              <Circle cx="56" cy="56" r={R} stroke="rgba(42,33,29,0.1)" strokeWidth="7" fill="none" />
              <Circle cx="56" cy="56" r={R} stroke={p >= 1 ? C.green : C.burgundy} strokeWidth="7" fill="none" strokeLinecap="round"
                strokeDasharray={`${CIR * p} ${CIR}`} transform="rotate(-90 56 56)" />
            </Svg>
            <View style={StyleSheet.absoluteFill}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontSize: 28, color: C.burgundyDeep }}>{today}</T>
                <T style={{ fontSize: 10, color: C.inkSoft, letterSpacing: 1 }}>TODAY</T>
              </View>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <Eyebrow style={{ fontSize: 10 }}>Daily goal</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <Pressable style={s.step} onPress={() => setDailyGoal(dailyGoal - 5)}><Icon name="minus" size={14} /></Pressable>
              <T style={{ fontSize: 26, marginHorizontal: 12 }}>{dailyGoal}</T>
              <Pressable style={s.step} onPress={() => setDailyGoal(dailyGoal + 5)}><Icon name="plus" size={14} /></Pressable>
            </View>
            <T style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 8 }}>
              {p >= 1 ? 'Goal reached — lovely.' : `${dailyGoal - today} pages to go today`}
            </T>
          </View>
        </View>

        <View style={s.chart}>
          {week.map((w, i) => {
            const hit = w.v >= dailyGoal;
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <T style={{ fontSize: 11, color: C.inkSoft, marginBottom: 4 }}>{w.v || ''}</T>
                <View style={{ height: 84, justifyContent: 'flex-end' }}>
                  <View style={{ width: 18, height: Math.max(3, (w.v / max) * 84), backgroundColor: hit ? C.green : C.burgundy, opacity: i === 6 ? 1 : 0.75, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
                </View>
                <T style={{ fontSize: 11, marginTop: 6, color: i === 6 ? C.burgundy : C.inkSoft }}>{DAYS[w.d.getDay()]}</T>
              </View>
            );
          })}
          <View pointerEvents="none" style={[s.goalLine, { bottom: 24 + (dailyGoal / max) * 84 }]} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <T style={{ fontSize: 12.5, color: C.inkSoft }}>{total} pages this week</T>
          <T style={{ fontSize: 12.5, color: C.green }}>{streak}-day streak</T>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 26 }}>
        <Eyebrow>Currently reading</Eyebrow>
      </View>
      {reading.map((b) => {
        const left = Math.max(1, daysBetween(new Date(), b.target || new Date(Date.now() + 14 * 86400000)));
        const perDay = Math.ceil((b.pages - b.pagesRead) / left);
        const ok = perDay <= dailyGoal;
        return (
          <View key={b.id} style={s.book}>
            <Pressable style={{ flexDirection: 'row' }} onPress={(e) => onOpen(b, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}>
              <View style={{ width: 10, backgroundColor: b.color, borderRadius: 2, marginRight: 14 }} />
              <View style={{ flex: 1 }}>
                <T style={{ fontSize: 18, color: C.burgundyDeep }} numberOfLines={1}>{b.title}</T>
                <T style={{ fontSize: 13, color: C.inkSoft }}>{b.author}</T>
              </View>
              <View style={[s.tag, { borderColor: ok ? C.green : C.burgundy }]}>
                <T style={{ fontSize: 11, letterSpacing: 0.6, color: ok ? C.green : C.burgundy }}>{ok ? 'On pace' : 'Behind'}</T>
              </View>
            </Pressable>
            <View style={{ marginTop: 14 }}><Bar value={b.pagesRead / b.pages} color={C.green} h={5} /></View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <T style={{ fontSize: 13 }}>p. {b.pagesRead} <T style={{ fontSize: 13, color: C.inkSoft }}>of {b.pages}</T></T>
              <T style={{ fontSize: 13, color: C.inkSoft }}>{Math.round((b.pagesRead / b.pages) * 100)}%</T>
            </View>
            <View style={s.plan}>
              <View style={{ flex: 1 }}>
                <T style={{ fontSize: 11, letterSpacing: 1.5, color: C.inkSoft }}>PLAN</T>
                <T style={{ fontSize: 14, marginTop: 2 }}>{perDay} pp/day → finish {fmtDate(b.target)}</T>
              </View>
              <Pressable style={s.step} onPress={() => setTarget(b.id, new Date(new Date(b.target).getTime() - 7 * 86400000).toISOString())}><Icon name="minus" size={13} /></Pressable>
              <T style={{ fontSize: 11, marginHorizontal: 6, color: C.inkSoft }}>1 wk</T>
              <Pressable style={s.step} onPress={() => setTarget(b.id, new Date(new Date(b.target).getTime() + 7 * 86400000).toISOString())}><Icon name="plus" size={13} /></Pressable>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <Button small label="Log 10 pages" onPress={() => setProgress(b.id, b.pagesRead + 10)} tone="green" />
              <Button small kind="outline" tone="green" label="+25" style={{ marginLeft: 8 }} onPress={() => setProgress(b.id, b.pagesRead + 25)} />
              <Button small kind="outline" tone="green" label="+50" style={{ marginLeft: 8 }} onPress={() => setProgress(b.id, b.pagesRead + 50)} />
            </View>
          </View>
        );
      })}
      {reading.length === 0 && <T style={{ paddingHorizontal: 20, paddingTop: 14, color: C.inkSoft }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</T>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  head: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  title: { fontSize: 34, marginTop: 2, color: C.burgundyDeep, letterSpacing: 0.3 },
  lede: { fontSize: 14, color: C.inkSoft, marginTop: 2 },
  card: { marginHorizontal: 20, padding: 18, backgroundColor: C.page, borderRadius: 12, borderWidth: 1, borderColor: C.line },
  chart: { flexDirection: 'row', marginTop: 20, paddingBottom: 0 },
  goalLine: { position: 'absolute', left: 0, right: 0, height: 1, borderTopWidth: 1, borderStyle: 'dashed', borderColor: C.green, opacity: 0.7 },
  step: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  book: { marginHorizontal: 20, marginTop: 14, padding: 16, backgroundColor: C.page, borderRadius: 12, borderWidth: 1, borderColor: C.line },
  tag: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' },
  plan: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line },
});
