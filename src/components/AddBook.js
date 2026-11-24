import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Easing } from 'react-native';
import { T, TI, C } from '../theme';
import { Button, Chip, Eyebrow } from './ui';

const GENRES = ['Fiction', 'Mystery', 'Fantasy', 'History', 'Science', 'Poetry', 'Essays'];
const STATUS = [['unread', 'To read'], ['reading', 'Reading'], ['read', 'Read']];

export default function AddBook({ onClose, onAdd, onImport }) {
  const a = useRef(new Animated.Value(0)).current;
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('Fiction');
  const [pages, setPages] = useState('');
  const [status, setStatus] = useState('unread');
  useEffect(() => { Animated.timing(a, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(); }, []);
  const close = () => Animated.timing(a, { toValue: 0, duration: 220, useNativeDriver: true }).start(onClose);
  const ok = title.trim() && author.trim();

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(36,24,18,0.5)', opacity: a }]}>
        <Pressable style={{ flex: 1 }} onPress={close} />
      </Animated.View>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View style={[s.sheet, { transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }] }]}>
          <View style={s.grab} />
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} style={{ maxHeight: 560 }}>
            <T style={{ fontSize: 26, color: C.burgundyDeep }}>Shelve a book</T>
            <T style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>Lorem ipsum dolor sit amet, consectetur adipiscing.</T>

            <Eyebrow style={s.lab}>Title</Eyebrow>
            <TI style={s.in} value={title} onChangeText={setTitle} placeholder="Lorem ipsum" />
            <Eyebrow style={s.lab}>Author</Eyebrow>
            <TI style={s.in} value={author} onChangeText={setAuthor} placeholder="Dolor Amet" />
            <Eyebrow style={s.lab}>Pages</Eyebrow>
            <TI style={s.in} value={pages} onChangeText={setPages} keyboardType="number-pad" placeholder="320" />
            <Eyebrow style={s.lab}>Genre</Eyebrow>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
              {GENRES.map((g) => <Chip key={g} label={g} active={genre === g} onPress={() => setGenre(g)} />)}
            </View>
            <Eyebrow style={s.lab}>Status</Eyebrow>
            <View style={{ flexDirection: 'row' }}>
              {STATUS.map(([k, l]) => <Chip key={k} label={l} tone="green" active={status === k} onPress={() => setStatus(k)} />)}
            </View>
            <View style={{ flexDirection: 'row', marginTop: 22, marginBottom: 6 }}>
              <Button label="Place on shelf" style={{ flex: 1, opacity: ok ? 1 : 0.45 }} onPress={() => ok && onAdd({ title, author, genre, pages: parseInt(pages, 10) || 250, status })} />
            </View>
            <Button kind="outline" tone="green" label="Import a simulated scan" style={{ marginTop: 8 }} onPress={onImport} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  sheet: { backgroundColor: C.paper, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 34 },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 14 },
  lab: { marginTop: 16, marginBottom: 6 },
  in: { borderBottomWidth: 1, borderBottomColor: 'rgba(42,33,29,0.3)', paddingVertical: 8, fontSize: 17 },
});
