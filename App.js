import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { T, C, FONT } from './src/theme';
import { LibraryProvider, useLibrary } from './src/store/LibraryContext';
import ShelvesScreen from './src/screens/ShelvesScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import BookPreview from './src/components/BookPreview';
import AddBook from './src/components/AddBook';
import { Icon } from './src/components/ui';

const TABS = [
  { key: 'shelves', label: 'Shelves', icon: 'shelf' },
  { key: 'library', label: 'Library', icon: 'case' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar' },
];

function Shell() {
  const insets = useSafeAreaInsets();
  const lib = useLibrary();
  const [tab, setTab] = useState('shelves');
  const [open, setOpen] = useState(null); // { id, origin }
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const toastA = useRef(new Animated.Value(0)).current;

  const onOpen = useCallback((book, origin) => setOpen({ id: book.id, origin }), []);

  const say = (msg) => {
    setToast(msg);
    toastA.setValue(0);
    Animated.sequence([
      Animated.timing(toastA, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastA, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const added = (book) => { setAdding(false); setTab('library'); say(`“${book.title}” placed on the shelf`); };
  const bottomPad = 96 + insets.bottom;
  const common = { onOpen, openId: open?.id, bottomPad };

  return (
    <View style={s.root}>
      <StatusBar style="dark" />
      <View style={s.glow} pointerEvents="none" />
      <View style={{ flex: 1, paddingTop: insets.top + 4 }}>
        {tab === 'shelves' && <ShelvesScreen {...common} />}
        {tab === 'library' && <LibraryScreen {...common} />}
        {tab === 'schedule' && <ScheduleScreen {...common} />}
      </View>

      <View style={[s.bar, { paddingBottom: insets.bottom + 6 }]}>
        {TABS.map((t) => <TabBtn key={t.key} t={t} on={tab === t.key} onPress={() => setTab(t.key)} />)}
      </View>
      <Pressable style={[s.plus, { bottom: 84 + insets.bottom }]} onPress={() => setAdding(true)}><Icon name="plus" size={26} color="#FBF3E2" /></Pressable>

      {toast && (
        <Animated.View pointerEvents="none" style={[s.toast, { bottom: 156 + insets.bottom, opacity: toastA, transform: [{ translateY: toastA.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
          <T style={{ color: '#FBF3E2', fontSize: 13 }}>{toast}</T>
        </Animated.View>
      )}

      {open && <BookPreview key={open.id} bookId={open.id} origin={open.origin} onClose={() => setOpen(null)} />}
      {adding && <AddBook onClose={() => setAdding(false)} onAdd={(b) => added(lib.addBook(b))} onImport={() => added(lib.importSample())} />}
    </View>
  );
}

function TabBtn({ t, on, onPress }) {
  return (
    <Pressable onPress={onPress} style={s.tab}>
      <Icon name={t.icon} size={22} color={on ? C.burgundy : C.inkSoft} />
      <T style={{ fontSize: 11, marginTop: 3, letterSpacing: 0.8, color: on ? C.burgundy : C.inkSoft }}>{t.label}</T>
    </Pressable>
  );
}

export default function App() {
  const [loaded] = useFonts({ [FONT]: require('./assets/fonts/Raleway-ExtraLight.ttf') });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <Shell />
      </LibraryProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper, overflow: 'hidden' },
  glow: { position: 'absolute', top: -160, right: -140, width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(233,196,120,0.18)' },
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingTop: 10, backgroundColor: 'rgba(241,233,218,0.97)', borderTopWidth: 1, borderTopColor: C.line },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 2 },
  plus: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.burgundy, alignItems: 'center', justifyContent: 'center', shadowColor: C.burgundyDeep, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  toast: { position: 'absolute', alignSelf: 'center', backgroundColor: C.green, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 22, maxWidth: '88%' },
});
