import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';

import { AppText, Badge, Button, ButtonRow, ProgressRing } from '@/components';
import { Colors, Radius, type ColorName } from '@/constants/theme';
import { useMotion } from '@/hooks/useMotion';

import type { DailyPractice } from '../types';

const ACTIVITIES: { emoji: string; tint: ColorName; title: string; note: string; score: string; ok: boolean }[] = [
  { emoji: '📖', tint: 'tealLight', title: 'Read · Context clues', note: 'All answers correct', score: '4/4 ✓', ok: true },
  { emoji: '🎧', tint: 'violetLight', title: 'Listen · Café dialogue', note: 'All answers correct', score: '3/3 ✓', ok: true },
  { emoji: '🗣️', tint: 'coralLight', title: 'Speak · Describe a photo', note: 'Tip: stress the 2nd syllable in “re-LUC-tant”', score: '2/3', ok: false },
];
const WORDS = ['reluctant', 'persuade', 'overcome', 'genuine', 'thrive', 'vivid'];

type Props = { practice: DailyPractice; onClose: () => void; onReview: () => void };

/** Bottom sheet with today's results. Slides up over a dimmed home screen; tap outside to close. */
export function ResultsSheet({ practice, onClose, onReview }: Props) {
  const s = practice.score!;
  const motion = useMotion();
  const pct = Math.round((s.correct / s.total) * 100);

  return (
    <View style={StyleSheet.absoluteFill} testID="results-sheet">
      <Animated.View entering={motion(FadeIn)} exiting={motion(FadeOut)} style={[StyleSheet.absoluteFill, styles.scrim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close results" />
      </Animated.View>

      <Animated.View entering={motion(SlideInDown.springify().damping(18))} exiting={motion(SlideOutDown.duration(220))} style={styles.sheet}>
        <View style={styles.grab} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.between}>
            <View>
              <AppText variant="title">Today&apos;s results 🎉</AppText>
              <AppText variant="caption" color="ink2">{s.minutesSpent} min · {s.total} questions</AppText>
            </View>
            <Badge label={`+${s.xpEarned} XP`} tone="mint" />
          </View>

          <View style={styles.hero}>
            <ProgressRing percent={pct} size={96} stroke={10} color={Colors.mint} track="#C8EEDA">
              <AppText variant="title" color="mintDeep">{s.correct}/{s.total}</AppText>
              <AppText variant="caption" color="ink2" style={styles.small}>{pct}% correct</AppText>
            </ProgressRing>
            <View style={styles.heroStats}>
              <AppText variant="heading">🔥 {practice.streakDays} days</AppText>
              <AppText variant="caption" color="ink2">streak · keep it going!</AppText>
              <AppText variant="heading" style={styles.gap}>📚 {s.wordsLearned} new words</AppText>
              <AppText variant="caption" color="ink2">added to your review deck</AppText>
            </View>
          </View>

          <AppText variant="overline" color="ink2" style={styles.label}>Activities</AppText>
          {ACTIVITIES.map((a) => (
            <View key={a.title} style={styles.activity}>
              <View style={[styles.actIcon, { backgroundColor: Colors[a.tint] }]}><AppText style={styles.emoji}>{a.emoji}</AppText></View>
              <View style={styles.flex}>
                <AppText variant="bodyBold">{a.title}</AppText>
                <AppText variant="caption" color="ink2">{a.note}</AppText>
              </View>
              <AppText variant="bodyBold" color={a.ok ? 'mintDeep' : 'coralText'}>{a.score}</AppText>
            </View>
          ))}

          <AppText variant="overline" color="ink2" style={styles.label}>Words you learned</AppText>
          <View style={styles.words}>
            {WORDS.slice(0, s.wordsLearned).map((w) => (
              <View key={w} style={styles.word}><AppText variant="caption" color="violetDeep">{w}</AppText></View>
            ))}
          </View>

          <ButtonRow>
            <Button label="↺ Review mistakes" tone="ghost" flex={1} onPress={onReview} />
            <Button label="Done" flex={1} onPress={onClose} testID="results-done" />
          </ButtonRow>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scrim: { backgroundColor: 'rgba(7,28,32,0.55)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', backgroundColor: Colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 10 },
  grab: { width: 44, height: 5, borderRadius: 5, backgroundColor: '#D5E2E5', alignSelf: 'center', marginBottom: 12 },
  content: { paddingHorizontal: 18, paddingBottom: 32 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 14, backgroundColor: Colors.mintLight, borderRadius: Radius.lg, padding: 14 },
  heroStats: { flex: 1 },
  small: { fontSize: 10 },
  gap: { marginTop: 8 },
  label: { marginTop: 18, marginBottom: 4 },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: Colors.line },
  actIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 18, lineHeight: 24 },
  words: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  word: { backgroundColor: Colors.violetLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
});
