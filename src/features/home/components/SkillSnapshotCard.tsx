import { StyleSheet, View } from 'react-native';

import { AnimatedBar, AppText, Button, Card, CountUpText, EmptyState } from '@/components';
import { Colors, Fonts, Radius, type ColorName } from '@/constants/theme';

import type { SkillSnapshot } from '../types';

type SkillKey = 'grammar' | 'vocabulary' | 'pronunciation' | 'speaking';

const SKILLS: { key: SkillKey; label: string; emoji: string; color: ColorName; tint: ColorName }[] = [
  { key: 'grammar', label: 'Grammar', emoji: '🧩', color: 'teal', tint: 'tealLight' },
  { key: 'vocabulary', label: 'Vocabulary', emoji: '📚', color: 'violet', tint: 'violetLight' },
  { key: 'pronunciation', label: 'Pronunciation', emoji: '🎙️', color: 'coral', tint: 'coralLight' },
  { key: 'speaking', label: 'Speaking', emoji: '💬', color: 'mint', tint: 'mintLight' },
];

function SkillRow({ skill, value, index }: { skill: (typeof SKILLS)[number]; value: number | null; index: number }) {
  return (
    <View style={[styles.skill, value == null && styles.ghost]} accessibilityLabel={`${skill.label} ${value ?? 'no data'} percent`}>
      <View style={[styles.skillIcon, { backgroundColor: Colors[skill.tint] }]}>
        <AppText style={styles.skillEmoji}>{skill.emoji}</AppText>
      </View>
      <View style={styles.flex}>
        <View style={styles.between}>
          <AppText variant="bodyBold">{skill.label}</AppText>
          <AppText variant="bodyBold" color="ink3">{value == null ? '—' : `${value}%`}</AppText>
        </View>
        <View style={styles.barGap}>
          {value == null ? <View style={styles.ghostBar} /> : <AnimatedBar percent={value} color={Colors[skill.color]} delay={300 + index * 90} />}
        </View>
      </View>
    </View>
  );
}

/** Four skills, overall improvement and growth — or an invitation to a placement check if there's no data yet. */
export function SkillSnapshotCard({ skills }: { skills: SkillSnapshot | null }) {
  if (!skills) {
    return (
      <Card testID="skills-empty">
        <EmptyState emoji="🔍" tint="violetLight" title="Let's find your strengths" body="A 3-minute check unlocks your personal skill map." />
        {SKILLS.map((s, i) => <SkillRow key={s.key} skill={s} value={null} index={i} />)}
        <Button label="🎯 Take the 3-min check" tone="violet" testID="placement-check" />
      </Card>
    );
  }

  const weakest = SKILLS.reduce((a, b) => (skills[a.key] <= skills[b.key] ? a : b));
  return (
    <Card testID="skills-card">
      <View style={styles.kpis}>
        <View style={[styles.kpi, { backgroundColor: Colors.tealFaint }]}>
          <AppText variant="caption" color="ink2">Overall improvement</AppText>
          <CountUpText value={skills.overallImprovementPercent} prefix="+" suffix="%" variant="title" />
          <AppText variant="caption" color="tealDeep">since you joined</AppText>
        </View>
        <View style={[styles.kpi, { backgroundColor: Colors.mintLight }]}>
          <AppText variant="caption" color="ink2">Since last check-in</AppText>
          <CountUpText value={skills.growthPercent} prefix="▲ " suffix="%" variant="title" color="mintDeep" />
          <AppText variant="caption" color="mintDeep">vs {skills.lastCheckIn}</AppText>
        </View>
      </View>
      {SKILLS.map((s, i) => <SkillRow key={s.key} skill={s} value={skills[s.key]} index={i} />)}
      <View style={styles.tip}>
        <AppText variant="caption" color="sunText">
          💡 <AppText variant="caption" color="sunText" style={styles.bold}>{weakest.label}</AppText> is your growth zone. Try today&apos;s speaking drill to boost it.
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  kpis: { flexDirection: 'row', gap: 10 },
  kpi: { flex: 1, borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 12 },
  skill: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  ghost: { opacity: 0.55 },
  skillIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  skillEmoji: { fontSize: 16, lineHeight: 22 },
  barGap: { marginTop: 6 },
  ghostBar: { height: 8, borderRadius: 8, backgroundColor: Colors.muted, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.line },
  tip: { marginTop: 12, backgroundColor: Colors.sunLight, borderRadius: Radius.sm, paddingVertical: 9, paddingHorizontal: 11 },
  bold: { fontFamily: Fonts.heavy },
});
