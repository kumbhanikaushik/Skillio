import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from '@/components/AppText';
import { Colors, Radius, type ColorName } from '@/constants/theme';

/** [background, text, 3D edge] — edge = null renders a flat (ghost) button. */
const TONES = {
  primary: ['teal', 'white', 'tealDeep'],
  sun: ['sun', 'sunText', 'sunDeep'],
  coral: ['coral', 'white', 'coralDeep'],
  mint: ['mint', 'white', 'mintDeep'],
  violet: ['violet', 'white', 'violetDeep'],
  live: ['rose', 'white', 'roseDeep'],
  ghost: ['tealLight', 'tealDeep', null],
  ghostViolet: ['violetLight', 'violetDeep', null],
  disabled: ['muted', 'ink3', null],
} as const satisfies Record<string, readonly [ColorName, ColorName, ColorName | null]>;

export type ButtonTone = keyof typeof TONES;

const EDGE = 5;

/** Width a label needs at 15.5px heavy (≈8.8px/char, emoji ≈ 2 chars) + padding — inside a ButtonRow this makes it wrap instead of truncating. */
const minWidthFor = (label: string) => Math.ceil([...label].reduce((w, ch) => w + (ch.charCodeAt(0) > 0x2000 ? 20 : 8.8), 0) + 32);

type Props = {
  label: string;
  onPress?: () => void;
  tone?: ButtonTone;
  /** flex-grow inside a row of buttons */
  flex?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Chunky 3D button: sinks onto its edge with a spring and a light haptic tap. */
export function Button({ label, onPress, tone = 'primary', flex, style, testID }: Props) {
  const [bg, fg, edge] = TONES[tone];
  const disabled = tone === 'disabled';
  const press = useSharedValue(0);

  const face = useAnimatedStyle(() => ({ transform: [{ translateY: press.value * (edge ? EDGE - 1 : 0) }] }));
  const scale = useAnimatedStyle(() => ({ transform: [{ scale: edge ? 1 : 1 - press.value * 0.03 }] }));

  const onPressIn = () => {
    press.value = withSpring(1, { damping: 20, stiffness: 600 });
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  const onPressOut = () => (press.value = withSpring(0, { damping: 12, stiffness: 320 }));

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.wrap, flex != null && { flexGrow: flex * 10, flexBasis: 0, minWidth: minWidthFor(label) }, edge && { paddingBottom: EDGE }, scale, style]}>
      {edge && <Animated.View style={[styles.edge, { backgroundColor: Colors[edge] }]} />}
      <Animated.View style={[styles.face, { backgroundColor: Colors[bg] }, face]}>
        <AppText variant="subheading" color={fg} numberOfLines={1}>
          {label}
        </AppText>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, minHeight: 50 },
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0, top: EDGE, borderRadius: Radius.md },
  face: {
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
});
