import { StyleSheet } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Colors, MaxContentWidth, Radius } from '@/constants/theme';
import { useMotion } from '@/hooks/useMotion';

/** Short confirmation pill at the top of the screen. Render it with a `key` per message so each one animates in. */
export function Toast({ message }: { message: string }) {
  const motion = useMotion();
  const { top } = useSafeAreaInsets();
  return (
    <Animated.View
      testID="toast"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      entering={motion(FadeInUp.springify().damping(16))}
      exiting={motion(FadeOutUp.duration(180))}
      style={[styles.toast, { top: top + 10 }]}>
      <AppText variant="bodyBold" color="white" center>
        {message}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: MaxContentWidth - 32,
    marginHorizontal: 16,
    backgroundColor: Colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    shadowColor: Colors.ink,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
