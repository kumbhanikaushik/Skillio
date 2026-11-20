import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { AppText, Badge, Button, ButtonRow, Card, Confetti, ProgressRing } from '@/components';
import { Colors, Radius } from '@/constants/theme';
import { useMotion } from '@/hooks/useMotion';

import type { DailyPractice } from '../types';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function WeekStrip({ week, doneToday }: { week: DailyPractice['week']; doneToday: boolean }) {
  return (
    <View style={styles.week}>
      {week.map((v, i) => {
        const today = v === null;
        const lit = today ? doneToday : v;
        return (
          <View key={i} style={styles.day}>
            <View style={[styles.dayDot, lit && styles.dayLit, today && (doneToday ? styles.todayDone : styles.today)]}>
              {lit && <AppText style={styles.flame}>🔥</AppText>}
            </View>
            <AppText variant="caption" color={today ? 'coral' : 'ink3'}>{DAYS[i]}</AppText>
          </View>
        );
      })}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="heading" center>{value}</AppText>
      <AppText variant="caption" color="ink2" center>{label}</AppText>
    </View>
  );
}

type Props = { practice: DailyPractice; onStart: () => void; onViewResults: () => void };

/** The daily habit loop: Start → (session) → Done + View results. */
export function PracticeCard({ practice: p, onStart, onViewResults }: Props) {
  const motion = useMotion();
  if (!p.completedToday || !p.score) {
    const fresh = p.streakDays === 0;
    return (
      <Card key="todo" testID="practice-card-todo">
        <View style={styles.head}>
          <View style={[styles.icon, { backgroundColor: Colors.sunLight }]}><AppText style={styles.iconText}>⚡</AppText></View>
          <View style={styles.flex}>
            <AppText variant="subheading">{fresh ? 'Your first daily mix' : `Today's ${p.estimatedMinutes}-min mix`}</AppText>
            <AppText color="ink2">{p.tasks.length} quick activities · +{p.xpReward} XP</AppText>
          </View>
          <Badge label={fresh ? 'NEW' : '⏳ 4h left'} tone={fresh ? 'teal' : 'coral'} />
        </View>
        <View style={styles.tasks}>
          {p.tasks.map((t) => (
            <View key={t.label} style={styles.task}>
              <AppText style={styles.taskEmoji} center>{t.emoji}</AppText>
              <AppText variant="caption" color="ink2" center>{t.label}</AppText>
            </View>
          ))}
        </View>
        <Button label="▶  Start practice" tone="sun" onPress={onStart} testID="start-practice" />
        <WeekStrip week={p.week} doneToday={false} />
        {!fresh && (
          <AppText variant="caption" color="ink2" center style={styles.hint}>
            Keep your 🔥 {p.streakDays}-day streak alive!
          </AppText>
        )}
      </Card>
    );
  }

  const s = p.score;
  const pct = Math.round((s.correct / s.total) * 100);
  return (
    <Card key="done" testID="practice-card-done">
      {motion(true) && <Confetti />}
      <View style={[styles.head, styles.doneHead]}>
        <View style={[styles.icon, { backgroundColor: Colors.mintLight }]}><AppText style={styles.iconText}>✅</AppText></View>
        <View style={styles.flex}>
          <AppText variant="subheading">Practice done. Nice!</AppText>
          <AppText color="ink2">{pct >= 80 ? 'You nailed it today 💪' : 'Solid effort, keep going 👏'}</AppText>
        </View>
        <Animated.View entering={motion(ZoomIn.springify().delay(250))}>
          <Badge label={`+${s.xpEarned} XP`} tone="mint" testID="xp-badge" />
        </Animated.View>
      </View>
      <View style={styles.result}>
        <ProgressRing percent={pct} size={62} stroke={7} color={Colors.mint} track="#C8EEDA">
          <AppText variant="bodyBold" color="mintDeep">{s.correct}/{s.total}</AppText>
        </ProgressRing>
        <Stat value={`${s.wordsLearned}`} label="new words" />
        <Stat value={`${s.minutesSpent}m`} label="time" />
        <Stat value={`🔥${p.streakDays}`} label="streak" />
      </View>
      <ButtonRow>
        <Button label="📊 View results" tone="ghost" flex={1} onPress={onViewResults} testID="view-results" />
        <Button label="↻ Bonus round" tone="ghostViolet" flex={0.75} onPress={onStart} />
      </ButtonRow>
      <WeekStrip week={p.week} doneToday />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doneHead: { marginTop: 12 },
  icon: { width: 50, height: 50, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 24, lineHeight: 30 },
  tasks: { flexDirection: 'row', gap: 6, marginTop: 12 },
  task: { flex: 1, backgroundColor: '#F6F9FA', borderRadius: Radius.sm, paddingVertical: 8 },
  taskEmoji: { fontSize: 18, lineHeight: 24 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderStyle: 'dashed', borderColor: Colors.line },
  day: { alignItems: 'center', gap: 4 },
  dayDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F5F6', alignItems: 'center', justifyContent: 'center' },
  dayLit: { backgroundColor: '#FFEBD9' },
  today: { backgroundColor: Colors.white, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.coral },
  todayDone: { backgroundColor: Colors.coral },
  flame: { fontSize: 14, lineHeight: 18 },
  hint: { marginTop: 10 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, backgroundColor: Colors.mintLight, borderRadius: Radius.md, padding: 12 },
  stat: { flex: 1 },
});
