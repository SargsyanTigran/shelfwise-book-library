import React from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { T, C } from '../theme';

export function Chip({ label, active, onPress, count, tone = 'burgundy' }) {
  const bg = active ? (tone === 'green' ? C.green : C.burgundy) : 'transparent';
  return (
    <Pressable onPress={onPress} style={[s.chip, { backgroundColor: bg, borderColor: active ? bg : C.line }]}>
      <T style={{ fontSize: 13, color: active ? '#FBF3E2' : C.ink, letterSpacing: 0.4 }}>{label}</T>
      {count != null && <T style={{ fontSize: 11, marginLeft: 6, color: active ? 'rgba(251,243,226,0.75)' : C.inkSoft }}>{count}</T>}
    </Pressable>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <View style={s.seg}>
      {options.map((o) => (
        <Pressable key={o.key} onPress={() => onChange(o.key)} style={[s.segItem, value === o.key && s.segOn]}>
          <T style={{ fontSize: 13, letterSpacing: 0.5, color: value === o.key ? C.burgundy : C.inkSoft }}>{o.label}</T>
        </Pressable>
      ))}
    </View>
  );
}

export function Button({ label, onPress, kind = 'solid', tone = 'burgundy', style, small }) {
  const col = tone === 'green' ? C.green : C.burgundy;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.btn, small && { paddingVertical: 6, paddingHorizontal: 10 },
        kind === 'solid' ? { backgroundColor: col } : { borderColor: col, borderWidth: 1 },
        pressed && { opacity: 0.7 }, style,
      ]}
    >
      <T style={{ fontSize: small ? 12 : 14, letterSpacing: 0.6, color: kind === 'solid' ? '#FBF3E2' : col }}>{label}</T>
    </Pressable>
  );
}

export function Eyebrow({ children, style }) {
  return <T style={[{ fontSize: 11, letterSpacing: 2.4, color: C.inkSoft, textTransform: 'uppercase' }, style]}>{children}</T>;
}

export function Bar({ value, color = C.green, h = 4, track = 'rgba(42,33,29,0.12)' }) {
  return (
    <View style={{ height: h, backgroundColor: track, borderRadius: h }}>
      <View style={{ height: h, width: `${Math.max(0, Math.min(1, value)) * 100}%`, backgroundColor: color, borderRadius: h }} />
    </View>
  );
}

export function Icon({ name, size = 22, color = C.ink, fill }) {
  const p = { stroke: color, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'shelf' && (<><Path d="M3 20h18" {...p} /><Rect x="5" y="6" width="3" height="14" {...p} /><Rect x="9.5" y="9" width="3" height="11" {...p} /><Path d="M15 20L13.8 7.5l3-.5L18.5 19.5" {...p} /></>)}
      {name === 'case' && (<><Path d="M12 3l7 3v12l-7 3-7-3V6z" {...p} /><Path d="M12 3v18M5 12l7 3 7-3" {...p} /></>)}
      {name === 'calendar' && (<><Rect x="4" y="5" width="16" height="15" rx="1.5" {...p} /><Path d="M4 10h16M9 3v4M15 3v4M8 14h3" {...p} /></>)}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...p} strokeWidth={1.6} />}
      {name === 'x' && <Path d="M6 6l12 12M18 6L6 18" {...p} />}
      {name === 'heart' && <Path d="M12 20s-7-4.4-7-10a4 4 0 017-2.4A4 4 0 0119 10c0 5.6-7 10-7 10z" {...p} fill={fill || 'none'} />}
      {name === 'bookmark' && <Path d="M7 4h10v17l-5-4-5 4z" {...p} fill={fill || 'none'} />}
      {name === 'minus' && <Path d="M5 12h14" {...p} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {name === 'rotate' && (<><Path d="M20 12a8 8 0 11-2.6-5.9" {...p} /><Path d="M20 4v4.5h-4.5" {...p} /></>)}
    </Svg>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14, marginRight: 8 },
  seg: { flexDirection: 'row', backgroundColor: 'rgba(42,33,29,0.06)', borderRadius: 10, padding: 3 },
  segItem: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
  segOn: { backgroundColor: C.page, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  btn: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
