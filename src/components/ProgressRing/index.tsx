import { useEffect, type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = PropsWithChildren<{
  percent: number;
  size: number;
  stroke: number;
  color: string;
  track: string;
  delay?: number;
  testID?: string;
}>;

/** Circular progress that sweeps from 0 → percent on mount and whenever the value changes. */
export function ProgressRing({ percent, size, stroke, color, track, delay = 0, children, testID }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withDelay(delay, withTiming(Math.min(Math.max(percent, 0), 100) / 100, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [percent, delay, p]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));

  return (
    <View testID={testID} style={{ width: size, height: size }} accessibilityLabel={`${Math.round(percent)} percent`}>
      <Svg width={size} height={size} style={styles.rotate}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  rotate: { transform: [{ rotate: '-90deg' }] },
  center: { alignItems: 'center', justifyContent: 'center' },
});
