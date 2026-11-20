import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SectionHeader, Toast } from '@/components';
import { SHOW_DEMO_SWITCHER } from '@/constants/flags';
import { Colors, MaxContentWidth } from '@/constants/theme';
import {
  ClassCard,
  DevStateSwitcher,
  HomeHeader,
  HomeTabBar,
  JourneyHero,
  PlanCard,
  PracticeCard,
  ResultsSheet,
  SkillSnapshotCard,
} from '@/features/home/components';
import { useHomeStore } from '@/features/home/store';
import { useMotion } from '@/hooks/useMotion';

/** Staggered fade-up so the screen "assembles" on open instead of popping in. */
function Section({ index, children }: { index: number; children: ReactNode }) {
  const motion = useMotion();
  return <Animated.View entering={motion(FadeInDown.delay(index * 70).springify().damping(18))}>{children}</Animated.View>;
}

export function HomeScreen() {
  const router = useRouter();
  const { top } = useSafeAreaInsets();
  const { scenario, data } = useHomeStore();
  const [showResults, setShowResults] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  // auto-hide the confirmation toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);
  const notify = (message: string) => setToast({ id: Date.now(), message });

  const startPractice = () => router.push('/practice');
  const classCard = <ClassCard data={data} onAction={notify} />;
  const practiceCard = (
    <PracticeCard practice={data.dailyPractice} onStart={startPractice} onViewResults={() => setShowResults(true)} />
  );
  // Time-sensitive first: a booked class leads "Today"; otherwise the daily habit does.
  const today = data.scheduledClass ? [classCard, practiceCard] : [practiceCard, classCard];

  return (
    <View style={styles.screen} testID="home-screen">
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: top + 8 }]} showsVerticalScrollIndicator={false}>
        <Section index={0}>
          <HomeHeader name={data.user.name} avatarUrl={data.user.avatarUrl} streakDays={data.dailyPractice.streakDays} />
        </Section>
        <Section index={1}>
          <JourneyHero progress={data.progress} subscription={data.subscription} />
        </Section>
        <Section index={2}>
          <SectionHeader title="Today" action={data.scheduledClass ? 'All classes' : undefined} />
          <View style={styles.stack}>{today.map((card, i) => <View key={i}>{card}</View>)}</View>
        </Section>
        <Section index={3}>
          <SectionHeader title="Skill snapshot" action={data.skillSnapshot ? 'Details' : undefined} />
          <SkillSnapshotCard skills={data.skillSnapshot} />
        </Section>
        <Section index={4}>
          <SectionHeader title="Your plan" />
          <PlanCard subscription={data.subscription} />
        </Section>
      </ScrollView>

      <HomeTabBar />
      {SHOW_DEMO_SWITCHER && !showResults && <DevStateSwitcher active={scenario} />}
      {showResults && data.dailyPractice.score && (
        <ResultsSheet
          practice={data.dailyPractice}
          onClose={() => setShowResults(false)}
          onReview={() => {
            setShowResults(false);
            startPractice();
          }}
        />
      )}
      {toast && <Toast key={toast.id} message={toast.message} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.canvas },
  content: { paddingHorizontal: 16, paddingBottom: 32, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  stack: { gap: 12 },
});
