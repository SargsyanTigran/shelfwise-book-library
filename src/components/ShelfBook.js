import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Easing } from 'react-native';
import Spine from './Spine';

/**
 * One book on a shelf. Slides to its slot with a spring, lifts forward when
 * pressed / opened, fades when filtered out and can "drop in" when stocked.
 */
function ShelfBook({ book, scale = 1, x, y, w, h, visible = true, pulled = false, enterDelay = null, onOpen }) {
  const pos = useRef(new Animated.ValueXY({ x, y })).current;
  const lift = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(enterDelay != null || !visible ? 0 : 1)).current;
  const drop = useRef(new Animated.Value(enterDelay != null ? -46 : 0)).current;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    Animated.spring(pos, { toValue: { x, y }, friction: 8, tension: 60, useNativeDriver: true }).start();
  }, [x, y]);

  useEffect(() => {
    Animated.timing(op, { toValue: visible ? 1 : 0, duration: 260, useNativeDriver: true }).start();
  }, [visible]);

  useEffect(() => {
    if (enterDelay == null) return;
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 320, delay: enterDelay, useNativeDriver: true }),
      Animated.spring(drop, { toValue: 0, delay: enterDelay, friction: 6, tension: 70, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(lift, { toValue: pulled ? 1 : 0, friction: 7, tension: 90, useNativeDriver: true }).start();
  }, [pulled]);

  const ty = lift.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const sc = lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        position: 'absolute', left: 0, top: 0, width: w, height: h + 6, opacity: op,
        zIndex: pulled ? 5 : 1,
        transform: [{ translateX: pos.x }, { translateY: pos.y }, { translateY: drop }, { translateY: ty }, { scale: sc }],
      }}
    >
      <Pressable
        onPress={(e) => onOpen && onOpen(book, { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
        hitSlop={{ top: 6, bottom: 4, left: 1, right: 1 }}
      >
        <Spine book={book} scale={scale} />
      </Pressable>
    </Animated.View>
  );
}
export default React.memo(ShelfBook);
