import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedBar, AppText, Button } from '@/components';
import { Colors, MaxContentWidth, Radius } from '@/constants/theme';
import { homeStore, useHomeStore } from '@/features/home/store';
import { OptionButton, type OptionState } from '@/features/practice/components/OptionButton';
import { QUESTIONS } from '@/features/practice/questions';
import { useMotion } from '@/hooks/useMotion';

const XP_PER_ANSWER = 4;

/** Demo practice session: one question at a time, instant feedback, then back to Home as "done". */
export function PracticeScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { data } = useHomeStore();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const motion = useMotion();

  const q = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;
  const right = picked === q.answer;

  const optionState = (i: number): OptionState => {
    if (picked === null) return 'idle';
    if (i === q.answer) return 'correct';
    return i === picked ? 'wrong' : 'dimmed';
  };

  const pick = (i: number) => {
    setPicked(i);
    if (i === q.answer) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const total = QUESTIONS.length;
    homeStore.completePractice({ correct, total, xpEarned: Math.round((data.dailyPractice.xpReward * correct) / total), wordsLearned: 6, minutesSpent: 7 });
    router.back();
  };

  return (
    <View style={[styles.screen, { paddingTop: top + 8 }]} testID="practice-screen">
      <View style={styles.inner}>
        <View style={styles.top}>
          <Pressable onPress={() => router.back()} style={styles.close} accessibilityLabel="Close practice" testID="close-practice">
            <AppText variant="bodyBold" color="ink2">✕</AppText>
          </Pressable>
          <View style={styles.flex}>
            <AnimatedBar percent={((index + (picked !== null ? 1 : 0)) / QUESTIONS.length) * 100} color={Colors.teal} height={12} track={Colors.line} />
          </View>
          <View style={styles.streak}>
            <AppText variant="bodyBold" color="coralText">🔥 {data.dailyPractice.streakDays}</AppText>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 24 }]} showsVerticalScrollIndicator={false} style={styles.scrollBleed}>
          <Animated.View key={index} entering={motion(FadeInRight.springify().damping(18))}>
            <AppText variant="caption" color="ink3" style={styles.counter} testID="question-counter">
              Question {index + 1} of {QUESTIONS.length} · {q.section}
            </AppText>
            <View style={styles.qCard}>
              <AppText variant="overline" color="tealDeep">{q.prompt}</AppText>
              <AppText variant="title" style={styles.sentence}>
                {q.sentence.replace('___', picked === null ? '______' : q.options[q.answer])}
              </AppText>
            </View>
            {q.options.map((o, i) => (
              <OptionButton key={o} label={o} letter={String.fromCharCode(65 + i)} state={optionState(i)} onPress={() => pick(i)} testID={`option-${i}`} />
            ))}
          </Animated.View>

          {picked !== null && (
            <Animated.View entering={motion(FadeIn.duration(250))} style={[styles.feedback, { backgroundColor: right ? Colors.mintLight : Colors.coralLight }]} testID="feedback">
              <AppText variant="heading" color={right ? 'mintDeep' : 'coralText'}>
                {right ? `✨ Nice! +${XP_PER_ANSWER} XP` : '💡 Almost — here’s why'}
              </AppText>
              <AppText color="ink2" style={styles.tip}>{q.tip}</AppText>
            </Animated.View>
          )}

          <Button
            label={picked === null ? 'Pick an answer' : isLast ? 'Finish 🎉' : 'Continue →'}
            tone={picked === null ? 'disabled' : 'mint'}
            onPress={next}
            testID="practice-continue"
            style={styles.cta}
          />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.canvas },
  inner: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: 16 },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 18 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  streak: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill, paddingHorizontal: 11, paddingVertical: 6 },
  // the list bleeds 8px past the column so the answer "pop" never gets clipped at the edges
  scrollBleed: { marginHorizontal: -8 },
  scroll: { paddingHorizontal: 8 },
  counter: { marginBottom: 8 },
  qCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.xl, padding: 18 },
  sentence: { marginTop: 10, fontSize: 21, lineHeight: 29 },
  feedback: { marginTop: 16, borderRadius: Radius.lg, padding: 14 },
  tip: { marginTop: 4 },
  cta: { marginTop: 18 },
});
