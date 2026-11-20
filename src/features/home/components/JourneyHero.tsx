import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AnimatedBar, AppText, CountUpText, ProgressRing } from '@/components';
import { Colors, Radius, Shadow } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { CEFR_LEVELS, cefrIndex } from '@/utils/cefr';

import type { Progress, Subscription } from '../types';

type Props = { progress: Progress; subscription: Subscription | null };

const WHITE_20 = 'rgba(255,255,255,0.22)';

function TierPill({ subscription }: { subscription: Subscription | null }) {
  const expired = subscription?.status === 'expired';
  const label = !subscription ? 'FREE' : expired ? `⏳ ${subscription.tier.toUpperCase()} EXPIRED` : `⭐ ${subscription.tier.toUpperCase()}`;
  return (
    <View testID="tier-pill" style={[styles.pill, expired && { backgroundColor: Colors.coral, borderColor: Colors.coral }]}>
      <AppText variant="caption" color="white">
        {label}
      </AppText>
    </View>
  );
}

/** The emotional anchor of the screen: where you are on the CEFR ladder and how close the next level is. */
export function JourneyHero({ progress, subscription }: Props) {
  const { currentCefrLevel: cur, nextCefrLevel: next, overallProgressPercent: pct, lessonsToNextLevel } = progress;
  const current = cefrIndex(cur);
  const { compact } = useResponsive();
  const ring = compact ? 84 : 104;
  const level = compact ? styles.levelCompact : null;

  return (
    <LinearGradient
      testID="journey-hero"
      colors={[Colors.tealBright, Colors.teal, Colors.tealDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />

      <View style={styles.top}>
        <AppText variant="overline" color="white" style={styles.dim}>
          Your English journey
        </AppText>
        <TierPill subscription={subscription} />
      </View>

      <View style={[styles.main, compact && styles.mainCompact]}>
        <ProgressRing percent={Math.max(pct, 1)} size={ring} stroke={compact ? 9 : 11} color={Colors.sun} track={WHITE_20} delay={200}>
          <CountUpText value={pct} suffix="%" color="white" delay={200} variant={compact ? 'title' : 'display'} />
          <AppText variant="caption" color="white" style={styles.dim}>
            to {next}
          </AppText>
        </ProgressRing>

        <View style={styles.flex}>
          <View style={styles.levels}>
            <View style={[styles.level, styles.levelCurrent, level]}>
              <AppText variant={compact ? 'heading' : 'title'} color="tealDeep">{cur}</AppText>
            </View>
            <View style={styles.flex}>
              <AnimatedBar percent={pct} color={Colors.sun} track={WHITE_20} height={4} delay={400} />
            </View>
            <View style={[styles.level, styles.levelNext, level]}>
              <AppText variant={compact ? 'heading' : 'title'} color="white">{next}</AppText>
            </View>
          </View>
          <AppText color="white" style={styles.copy}>
            {pct === 0
              ? `Your journey to ${next} starts today. Finish your first practice to get moving!`
              : `${100 - pct}% to go · about ${lessonsToNextLevel} lessons until you level up to ${next} 🚀`}
          </AppText>
        </View>
      </View>

      <View style={styles.track}>
        {CEFR_LEVELS.map((l, i) => (
          <View key={l} style={[styles.step, i < current && styles.stepDone, i === current && styles.stepNow]}>
            <AppText variant="caption" color={i === current ? 'tealDeep' : 'white'} style={i > current && styles.dim}>
              {l}
            </AppText>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: Radius.xl, padding: 18, overflow: 'hidden', ...Shadow.hero },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },
  blobA: { width: 220, height: 220, right: -70, top: -90 },
  blobB: { width: 120, height: 120, left: -40, bottom: -60 },
  // wraps so the tier pill drops below the label with large system fonts instead of being clipped
  top: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  dim: { opacity: 0.85 },
  pill: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.pill },
  main: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  flex: { flex: 1 },
  levels: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  level: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  levelCompact: { width: 38, height: 38, borderRadius: 12 },
  mainCompact: { gap: 12 },
  levelCurrent: { backgroundColor: Colors.white },
  levelNext: { borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.7)' },
  copy: { marginTop: 10, fontSize: 13 },
  track: { flexDirection: 'row', gap: 4, marginTop: 14 },
  step: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.14)' },
  stepDone: { backgroundColor: 'rgba(255,255,255,0.32)' },
  stepNow: { backgroundColor: Colors.white },
});
