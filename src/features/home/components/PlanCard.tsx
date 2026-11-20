import { StyleSheet, View } from 'react-native';

import { AppText, Badge, Card } from '@/components';
import { Colors, type ColorName } from '@/constants/theme';

import type { Subscription } from '../types';

function LessonDots({ total, remaining, warn }: { total: number; remaining: number; warn: boolean }) {
  const used = total - remaining;
  return (
    <View style={styles.dots} accessibilityLabel={`${remaining} of ${total} lessons left`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i >= used && { backgroundColor: warn ? Colors.coral : Colors.teal }]} />
      ))}
    </View>
  );
}

type PlanView = { emoji: string; tint: ColorName; title: string; subtitle: string; badge?: [string, 'sun' | 'coral' | 'grey']; foot: string; link: string };

function describe(s: Subscription | null): PlanView {
  if (!s) return { emoji: '🆓', tint: 'muted', title: 'Free plan', subtitle: 'Daily practice is always free. Live classes need Pro.', foot: '0 live lessons', link: 'Compare plans →' };
  if (s.status === 'expired')
    return { emoji: '⏳', tint: 'muted', title: `Skillio ${s.tier}`, subtitle: `Ended ${s.expiredOn} · renew to unlock live lessons`, badge: ['EXPIRED', 'grey'], foot: 'Daily practice is still free ✨', link: 'Renew now →' };
  const warn = s.lessonsRemaining <= 2;
  return {
    emoji: warn ? '⚠️' : '⭐',
    tint: warn ? 'coralLight' : 'sunLight',
    title: `Skillio ${s.tier}`,
    subtitle: `${s.lessonsRemaining} of ${s.totalLessons} live lessons left`,
    badge: [s.lessonsRemaining === 0 ? 'EMPTY' : 'ACTIVE', warn ? 'coral' : 'sun'],
    foot: `Renews ${s.renewsOn}`,
    link: s.lessonsRemaining === 0 ? 'Top up now →' : 'Manage plan →',
  };
}

/** Plan + lessons remaining. Turns coral early (≤ 2 left) so running out is never a surprise. */
export function PlanCard({ subscription: s }: { subscription: Subscription | null }) {
  const v = describe(s);
  const active = s && s.status === 'active';
  return (
    <Card testID="plan-card">
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: Colors[v.tint] }]}><AppText style={styles.emoji}>{v.emoji}</AppText></View>
        <View style={styles.flex}>
          <AppText variant="subheading">{v.title}</AppText>
          <AppText variant="caption" color="ink2">{v.subtitle}</AppText>
        </View>
        {v.badge && <Badge label={v.badge[0]} tone={v.badge[1]} />}
      </View>
      {s && <LessonDots total={s.totalLessons} remaining={active ? s.lessonsRemaining : 0} warn={!!active && s.lessonsRemaining <= 2} />}
      <View style={styles.foot}>
        <AppText variant="caption" color="ink2">{v.foot}</AppText>
        <AppText variant="caption" color="teal">{v.link}</AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22, lineHeight: 28 },
  dots: { flexDirection: 'row', gap: 4, marginTop: 12 },
  dot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.muted },
  foot: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 12, rowGap: 4, marginTop: 10 },
});

