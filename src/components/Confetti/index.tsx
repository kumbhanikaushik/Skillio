import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

const COLORS = [Colors.teal, Colors.sun, Colors.coral, Colors.violet, Colors.mint];
const PIECES = Array.from({ length: 14 }, (_, i) => ({
  left: 6 + ((i * 37) % 88),
  color: COLORS[i % COLORS.length],
  drift: ((i % 5) - 2) * 10,
  spin: (i % 2 ? 1 : -1) * (120 + i * 15),
  delay: (i % 7) * 50,
}));

function Piece({ left, color, drift, spin, delay }: (typeof PIECES)[number]) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }));
  }, [delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.85 ? 1 : (1 - t.value) / 0.15,
    transform: [
      { translateY: -20 + t.value * 60 },
      { translateX: drift * t.value },
      { rotate: `${spin * t.value}deg` },
    ],
  }));

  return <Animated.View style={[styles.piece, { left: `${left}%`, backgroundColor: color }, style]} />;
}

/** One-shot confetti burst across the top of its parent. Celebrate, then get out of the way. */
export function Confetti() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PIECES.map((p, i) => (
        <Piece key={i} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, width: 7, height: 12, borderRadius: 2 },
});
