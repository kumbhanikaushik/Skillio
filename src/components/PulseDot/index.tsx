import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = { color: string; size?: number };

/** A dot with a breathing halo — used for LIVE states. */
export function PulseDot({ color, size = 7 }: Props) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }), -1, false);
  }, [t]);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - t.value),
    transform: [{ scale: 1 + t.value * 1.6 }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.round, { backgroundColor: color }, halo]} />
      <View style={[StyleSheet.absoluteFill, styles.round, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({ round: { borderRadius: 99 } });
