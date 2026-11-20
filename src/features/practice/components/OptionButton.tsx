import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { AppText } from '@/components';
import { Colors, Radius } from '@/constants/theme';

export type OptionState = 'idle' | 'correct' | 'wrong' | 'dimmed';

const LOOK: Record<OptionState, { border: string; bg: string; mark: string; markBg: string }> = {
  idle: { border: Colors.line, bg: Colors.white, mark: Colors.ink3, markBg: 'transparent' },
  correct: { border: Colors.mint, bg: Colors.mintLight, mark: Colors.white, markBg: Colors.mint },
  wrong: { border: Colors.coral, bg: Colors.coralLight, mark: Colors.white, markBg: Colors.coral },
  dimmed: { border: Colors.line, bg: Colors.white, mark: Colors.ink3, markBg: 'transparent' },
};

type Props = { label: string; letter: string; state: OptionState; onPress: () => void; testID?: string };

/** Answer option: pops on correct, shakes on wrong, with matching haptics. */
export function OptionButton({ label, letter, state, onPress, testID }: Props) {
  const scale = useSharedValue(1);
  const x = useSharedValue(0);

  useEffect(() => {
    if (state === 'correct') {
      scale.value = withSequence(withTiming(1.02, { duration: 110 }), withSpring(1, { damping: 14, stiffness: 260 }));
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    if (state === 'wrong') {
      x.value = withSequence(...[-8, 8, -6, 6, 0].map((v) => withTiming(v, { duration: 55 })));
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [state, scale, x]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: x.value }] }));
  const look = LOOK[state];
  const mark = state === 'correct' ? '✓' : state === 'wrong' ? '✕' : letter;

  return (
    <Animated.View style={[anim, state === 'dimmed' && styles.dimmed]}>
      <Pressable testID={testID} disabled={state !== 'idle'} onPress={onPress} style={[styles.opt, { borderColor: look.border, backgroundColor: look.bg }]}>
        <View style={[styles.mark, { borderColor: look.border, backgroundColor: look.markBg }]}>
          <AppText variant="caption" style={{ color: look.mark }}>{mark}</AppText>
        </View>
        <AppText variant="subheading">{label}</AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderRadius: Radius.md + 2, padding: 15, marginTop: 10 },
  mark: { width: 28, height: 28, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dimmed: { opacity: 0.5 },
});
