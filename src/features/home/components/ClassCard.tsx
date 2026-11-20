import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Badge, Button, ButtonRow, Card, EmptyState } from '@/components';
import { Colors, Radius } from '@/constants/theme';
import { useCountdown } from '@/hooks/useCountdown';

import { getClassState } from '../classState';
import type { HomePayload, ScheduledClass } from '../types';

const SLOTS = [
  { day: 'Tomorrow', time: '4:00 PM' },
  { day: 'Fri', time: '5:30 PM' },
  { day: 'Sat', time: '11:00 AM' },
];

function TeacherRow({ c }: { c: ScheduledClass }) {
  const initials = c.teacher.replace(/^(Ms|Mr|Mrs|Dr)\.\s*/, '').split(' ').map((w) => w[0]).join('');
  return (
    <View style={styles.teacher}>
      <LinearGradient colors={['#C9B8FF', Colors.violet]} style={styles.avatar}>
        <AppText variant="heading" color="white">{initials}</AppText>
      </LinearGradient>
      <View style={styles.flex}>
        <AppText variant="subheading">{c.subject}</AppText>
        <AppText color="ink2">with {c.teacher} · {c.durationMin} min</AppText>
      </View>
    </View>
  );
}

function Countdown({ minutes }: { minutes: number }) {
  const { h, m, s } = useCountdown(minutes);
  // Calm "hrs · min" until the final 10 minutes, then seconds join in as a final countdown.
  const final = Number(h) === 0 && Number(m) < 10;
  const cells = final ? [[m, 'min'], [s, 'sec']] : [[h, 'hrs'], [m, 'min']];
  return (
    // Screen readers get one calm label that changes once a minute; the ticking digits are visual only
    // (otherwise TalkBack/UiAutomator receive a content-change event every second).
    <View style={styles.count} testID="class-countdown" accessible accessibilityLabel={`Class starts in ${Number(h) * 60 + Number(m)} minutes`}>
      {cells.map(([v, l]) => (
        <View key={l} style={styles.countCell} importantForAccessibility="no-hide-descendants">
          <AppText variant="title" color={final ? 'coralText' : 'tealDeep'} center>{v}</AppText>
          <AppText variant="overline" color="ink3" center style={styles.countLabel}>{l}</AppText>
        </View>
      ))}
    </View>
  );
}

/** Time slots + Book button; booking confirms the chosen slot. */
function SlotPicker({ onBook }: { onBook: (slot: string) => void }) {
  const [selected, setSelected] = useState(1);
  return (
    <>
    <View style={styles.slots}>
      {SLOTS.map((slot, i) => (
        <Pressable key={slot.day} onPress={() => setSelected(i)} style={[styles.slot, i === selected && styles.slotOn]}>
          <AppText variant="caption" color={i === selected ? 'tealDeep' : 'ink2'} center>{slot.day}</AppText>
          <AppText variant="bodyBold" color={i === selected ? 'tealDeep' : 'ink'} center>{slot.time}</AppText>
        </Pressable>
      ))}
    </View>
    <Button label="📅 Book a class" testID="book-class" onPress={() => onBook(`${SLOTS[selected].day} · ${SLOTS[selected].time}`)} />
    </>
  );
}

/** Class status: join (upcoming/live), book, or the right recovery action for each edge case. */
/** `onAction` shows a confirmation toast — every button responds, even though the backend is mocked. */
export function ClassCard({ data, onAction }: { data: HomePayload; onAction: (message: string) => void }) {
  const state = getClassState(data);
  const c = data.scheduledClass;
  const s = data.subscription;

  switch (state) {
    case 'live':
      return (
        <Card key={state} testID="class-card-live" style={{ borderColor: '#FFC9D5' }}>
          <View style={styles.top}>
            <Badge label="LIVE NOW" tone="live" live />
            <AppText variant="caption" color="ink3">Started 2 min ago</AppText>
          </View>
          <TeacherRow c={c!} />
          <Button label="🎥 Join class now" tone="live" testID="join-class" onPress={() => onAction(`🎥 Joining ${c!.teacher}…`)} />
        </Card>
      );
    case 'upcoming':
      return (
        <Card key={state} testID="class-card-upcoming">
          <View style={styles.top}>
            <Badge label="📅 UP NEXT" />
            <AppText variant="caption" color="ink3">{c!.time}</AppText>
          </View>
          <TeacherRow c={c!} />
          <Countdown minutes={c!.startsInMin} />
          <ButtonRow>
            <Button label="Reschedule" tone="ghost" flex={0.6} onPress={() => onAction('📅 Rescheduling opens in Classes')} />
            <Button label="Join class →" flex={1} testID="join-class" onPress={() => onAction(`🔔 We'll remind you 10 min before ${c!.time.split(' · ').pop()}`)} />
          </ButtonRow>
        </Card>
      );
    case 'noSubscription':
      return (
        <Card key={state} testID="class-card-upsell" style={styles.upsellCard}>
        <LinearGradient colors={['#2B1B6B', Colors.violetDeep, Colors.violet]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.upsell}>
          <View style={styles.teacher}>
            <View style={[styles.avatar, styles.glass]}><AppText style={styles.emoji}>🎓</AppText></View>
            <View style={styles.flex}>
              <AppText variant="subheading" color="white">Learn live with a real teacher</AppText>
              <AppText color="white" style={styles.dim}>1-on-1 classes are part of Skillio Pro</AppText>
            </View>
          </View>
          <View style={styles.perks}>
            {['🗣️ Speaking practice', '🎯 Exam prep', '📈 Faster to B2'].map((p) => (
              <View key={p} style={styles.perk}><AppText variant="caption" color="white">{p}</AppText></View>
            ))}
          </View>
          <Button label="✨ Start 7-day free trial" tone="sun" testID="start-trial" onPress={() => onAction('✨ Your 7-day Pro trial has started!')} />
        </LinearGradient>
        </Card>
      );
    case 'expired':
      return (
        <Card key={state} testID="class-card-expired" style={{ borderColor: '#FFD3C4' }}>
          <EmptyState emoji="⏳" tint="coralLight" title="Live classes are paused" body={`Your ${s!.tier} plan ended on ${s!.expiredOn}. Your progress, streak and skills are all safe 🔒`} />
          <ButtonRow>
            <Button label="See plans" tone="ghost" flex={0.7} onPress={() => onAction('📋 Plans open in Profile')} />
            <Button label={`↻ Renew ${s!.tier}`} flex={1} testID="renew-plan" onPress={() => onAction(`✅ ${s!.tier} renewed — welcome back!`)} />
          </ButtonRow>
        </Card>
      );
    case 'noLessons':
      return (
        <Card key={state} testID="class-card-no-lessons">
          <EmptyState emoji="🎟️" tint="coralLight" title={`You've used all ${s!.totalLessons} lessons`} body="Amazing work this month! Top up to keep booking live classes." />
          <ButtonRow>
            <Button label="🔒 Book" tone="disabled" flex={0.6} />
            <Button label="+ Add lessons" tone="coral" flex={1} testID="add-lessons" onPress={() => onAction('🎟️ Lesson top-up opens in Profile')} />
          </ButtonRow>
        </Card>
      );
    default:
      return (
        <Card key={state} testID="class-card-book">
          <EmptyState emoji="🗓️" tint="tealLight" title="No class booked yet" body="Students who take 2 classes a week reach the next level 2× faster." />
          <SlotPicker onBook={(slot) => onAction(`✅ Booked for ${slot}`)} />
        </Card>
      );
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  avatar: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  count: { flexDirection: 'row', gap: 6, marginTop: 14 },
  countCell: { flex: 1, backgroundColor: Colors.tealFaint, borderRadius: Radius.sm, paddingVertical: 8 },
  countLabel: { fontSize: 10 },
  slots: { flexDirection: 'row', gap: 6, marginTop: 12 },
  slot: { flex: 1, borderWidth: 1.5, borderColor: Colors.line, borderRadius: Radius.sm, paddingVertical: 7 },
  slotOn: { borderColor: Colors.teal, backgroundColor: Colors.tealFaint },
  upsellCard: { padding: 0, borderWidth: 0 },
  upsell: { padding: 16, paddingTop: 4 },
  glass: { backgroundColor: 'rgba(255,255,255,0.18)' },
  emoji: { fontSize: 22, lineHeight: 28 },
  dim: { opacity: 0.85 },
  perks: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  perk: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: Radius.pill },
});
