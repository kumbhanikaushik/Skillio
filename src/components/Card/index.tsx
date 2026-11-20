import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Colors, Radius, Shadow, Spacing } from '@/constants/theme';
import { useMotion } from '@/hooks/useMotion';

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle>; testID?: string }>;

/**
 * White rounded card. Cross-fades in/out and animates its height when its content swaps,
 * so state changes (class ↔ no class, start ↔ results) never jump.
 */
export function Card({ children, style, testID }: Props) {
  const motion = useMotion();
  return (
    <Animated.View
      testID={testID}
      entering={motion(FadeIn.duration(320))}
      exiting={motion(FadeOut.duration(180))}
      layout={motion(LinearTransition.springify().damping(18))}
      style={[styles.card, style]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.line,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.card,
  },
});
