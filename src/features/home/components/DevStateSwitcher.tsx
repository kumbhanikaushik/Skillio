import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components';
import { Colors, MaxContentWidth, Radius } from '@/constants/theme';
import { useMotion } from '@/hooks/useMotion';
import { useResponsive } from '@/hooks/useResponsive';

import { SCENARIO_KEYS, SCENARIOS, type ScenarioKey } from '../mockData';
import { homeStore } from '../store';

/**
 * DEV ONLY — 🧪 button that opens a bottom sheet with every demo state in a 2-column grid.
 * Picking a state swaps it live (cards animate) and closes the sheet, so nothing stays on top of the UI.
 * Labels wrap instead of truncating; the selected state is the teal tile (and `selected` for screen readers).
 * Shown in development and in the demo APK (see constants/flags.ts); off in a normal production build.
 */
export function DevStateSwitcher({ active }: { active: ScenarioKey }) {
  const [open, setOpen] = useState(false);
  const motion = useMotion();
  const { bottom } = useSafeAreaInsets();
  const oneColumn = useResponsive().width < 340; // folded foldables: one state per row

  const pick = (k: ScenarioKey) => {
    homeStore.setScenario(k);
    setOpen(false);
  };

  return (
    <>
      {!open && (
        <Pressable testID="dev-switcher" onPress={() => setOpen(true)} style={styles.fab} accessibilityRole="button" accessibilityLabel="Demo states">
          <AppText variant="caption" color="white">🧪 States</AppText>
        </Pressable>
      )}

      {open && (
        <View style={StyleSheet.absoluteFill} testID="state-sheet">
          <Animated.View entering={motion(FadeIn)} exiting={motion(FadeOut)} style={[StyleSheet.absoluteFill, styles.scrim]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityLabel="Close demo states" />
          </Animated.View>

          <Animated.View
            entering={motion(SlideInDown.springify().damping(18))}
            exiting={motion(SlideOutDown.duration(200))}
            style={[styles.sheet, { paddingBottom: Math.max(bottom, 16) + 8 }]}>
            <View style={styles.grab} />
            <View style={styles.head}>
              <AppText variant="heading">🧪 Demo states</AppText>
              <Pressable testID="state-sheet-close" onPress={() => setOpen(false)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
                <AppText variant="caption" color="ink3">Dev only · ✕</AppText>
              </Pressable>
            </View>

            <View style={styles.grid}>
              {SCENARIO_KEYS.map((k) => {
                const s = SCENARIOS[k];
                const on = k === active;
                return (
                  <Pressable
                    key={k}
                    testID={`state-${k}`}
                    onPress={() => pick(k)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={({ pressed }) => [styles.item, oneColumn && styles.itemFull, on && styles.itemOn, pressed && styles.pressed]}>
                    <AppText style={styles.emoji}>{s.emoji}</AppText>
                    <View style={styles.flex}>
                      <AppText variant="bodyBold" color={on ? 'tealDeep' : 'ink'}>{s.label}</AppText>
                      <AppText variant="caption" color="ink2">{s.hint}</AppText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fab: { position: 'absolute', right: 12, bottom: 96, backgroundColor: Colors.ink, paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill, opacity: 0.92 },
  scrim: { backgroundColor: 'rgba(7,28,32,0.55)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  grab: { width: 44, height: 5, borderRadius: 5, backgroundColor: '#D5E2E5', alignSelf: 'center', marginBottom: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  item: {
    width: '48.5%', // two equal columns; an odd last item stays half-width
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.line,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minHeight: 56,
  },
  itemFull: { width: '100%' },
  itemOn: { borderColor: Colors.teal, backgroundColor: Colors.tealLight },
  pressed: { opacity: 0.7 },
  emoji: { fontSize: 20, lineHeight: 26 },
});
