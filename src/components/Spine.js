import React from 'react';
import { View, StyleSheet } from 'react-native';
import { T, C, isLight } from '../theme';
import { spineSize } from '../utils/layout';

/** Purely visual book spine. Lent-out books render as an empty shelf slot. */
export default function Spine({ book, scale = 1 }) {
  const { w, h } = spineSize(book, scale);
  const lent = book.loan?.type === 'lent';
  const borrowed = book.loan?.type === 'borrowed';
  const light = isLight(book.color);
  const fg = light ? C.ink : '#F6EEDD';
  const band = light ? 'rgba(42,33,29,0.35)' : 'rgba(246,238,221,0.45)';

  if (lent) {
    return (
      <View style={{ width: w, height: h }}>
        <View style={[styles.slot, { width: w, height: h }]}>
          <View style={styles.slotInner} />
        </View>
        {scale >= 0.75 && (
          <View style={[styles.rot, { width: h, height: w, left: (w - h) / 2, top: (h - w) / 2 }]}>
            <T style={{ fontSize: 10, letterSpacing: 2, color: C.inkFaint }} numberOfLines={1}>ON LOAN</T>
          </View>
        )}
      </View>
    );
  }

  const fs = Math.max(8, Math.min(12, Math.round(12 * scale * (w > 30 * scale ? 1.05 : 0.95))));
  return (
    <View style={{ width: w, height: h }}>
      {borrowed && (
        <>
          {/* hanging tag, sticks up above the book */}
          <View style={[styles.tagString, { left: w / 2 - 0.5 }]} />
          <View style={[styles.tag, { left: w / 2 - 6 * scale - 1, width: 12 * scale + 2 }]}>
            <View style={styles.tagHole} />
          </View>
        </>
      )}
      <View style={[styles.body, { backgroundColor: book.color, width: w, height: h }]}>
        <View style={styles.shade} />
        <View style={[styles.hl]} />
        <View style={[styles.line, { top: 6 * scale + 2, backgroundColor: band }]} />
        <View style={[styles.line, { top: 6 * scale + 6, backgroundColor: band }]} />
        <View style={[styles.line, { bottom: 14 * scale + 2, backgroundColor: band }]} />
        <View style={[styles.rot, { width: h - 44 * scale, height: w, left: (w - (h - 44 * scale)) / 2, top: (h - w) / 2 }]}>
          <T numberOfLines={1} style={{ fontSize: fs, color: fg, letterSpacing: 0.6 }}>{book.title}</T>
        </View>
        <View style={[styles.mark, { borderColor: band, width: 7 * scale + 2, height: 7 * scale + 2, left: w / 2 - (7 * scale + 2) / 2 }]} />
        {borrowed && (
          <View style={styles.loanBand}>
            <View style={styles.loanBandIn} />
          </View>
        )}
      </View>
      {book.status === 'reading' && (
        <View style={[styles.ribbon, { left: w / 2 - 3 }]}>
          <View style={styles.ribbonTail} />
        </View>
      )}
      {book.favorite && <View style={[styles.star, { left: w / 2 - 3 }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  body: { borderTopLeftRadius: 2, borderTopRightRadius: 2, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 2, shadowOffset: { width: 1, height: 0 }, elevation: 2 },
  shade: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '28%', backgroundColor: 'rgba(0,0,0,0.13)' },
  hl: { position: 'absolute', left: 1, top: 0, bottom: 0, width: 1.5, backgroundColor: 'rgba(255,255,255,0.22)' },
  line: { position: 'absolute', left: 0, right: 0, height: 1 },
  rot: { position: 'absolute', transform: [{ rotate: '-90deg' }], alignItems: 'center', justifyContent: 'center' },
  mark: { position: 'absolute', bottom: 4, borderWidth: 1, borderRadius: 10 },
  slot: { borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,240,220,0.35)', borderRadius: 2, backgroundColor: 'rgba(20,10,5,0.32)', overflow: 'hidden' },
  slotInner: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: 'rgba(0,0,0,0.25)' },
  ribbon: { position: 'absolute', bottom: -7, width: 6, height: 12, backgroundColor: C.green, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center' },
  ribbonTail: { position: 'absolute', bottom: -1, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 3, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: C.paper },
  star: { position: 'absolute', bottom: 16, width: 6, height: 6, backgroundColor: C.gold, transform: [{ rotate: '45deg' }], opacity: 0.95 },
  loanBand: { position: 'absolute', top: '30%', left: 0, right: 0, height: 12, backgroundColor: '#F3E7CC', borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.burgundy, justifyContent: 'center', alignItems: 'center' },
  loanBandIn: { width: '55%', height: 2, backgroundColor: C.burgundy },
  tagString: { position: 'absolute', top: -13, width: 1, height: 14, backgroundColor: C.burgundy, zIndex: 3 },
  tag: { position: 'absolute', top: -21, height: 10, backgroundColor: '#F3E7CC', borderWidth: 1, borderColor: C.burgundy, borderRadius: 2, zIndex: 4, alignItems: 'center', justifyContent: 'center' },
  tagHole: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.burgundy },
});
