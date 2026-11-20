import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';

type Props = { percent: number; color: string; delay?: number; height?: number; track?: string };

/** Horizontal progress bar that fills from 0 on mount. */
export function AnimatedBar({ percent, color, delay = 0, height = 8, track = Colors.muted }: Props) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(percent, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [percent, delay, w]);

  const fill = useAnimatedStyle(() => ({ width: `${w.value}%` }));

  return (
    <View style={[styles.track, { height, backgroundColor: track }]}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fill]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
});
