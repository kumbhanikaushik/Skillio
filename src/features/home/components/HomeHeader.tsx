import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components';
import { Colors, Radius } from '@/constants/theme';
import { useGreeting } from '@/hooks/useGreeting';
import { useResponsive } from '@/hooks/useResponsive';

type Props = { name: string; avatarUrl: string | null; streakDays: number };

export function HomeHeader({ name, avatarUrl, streakDays }: Props) {
  const greeting = useGreeting();
  const hasStreak = streakDays > 0;
  const { compact } = useResponsive();
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = !!avatarUrl && !photoFailed;

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <LinearGradient colors={[Colors.teal, Colors.sun, Colors.coral]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.ring, compact && styles.ringCompact]}>
        <View style={styles.avatar}>
          {showPhoto ? (
            // the student's photo; falls back to their initial if there is none or it fails to load
            <Image source={{ uri: avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} onError={() => setPhotoFailed(true)} accessibilityLabel={`${name}'s photo`} />
          ) : (
            <AppText variant="heading" color="coralText">
              {name[0]}
            </AppText>
          )}
        </View>
      </LinearGradient>

      <View style={styles.flex}>
        <AppText variant="caption" color="ink3" numberOfLines={1}>
          {compact ? greeting.text : `${greeting.text} ${greeting.emoji}`}
        </AppText>
        <AppText variant={compact ? 'heading' : 'title'} testID="greeting-name" numberOfLines={1}>
          Hey {name}!
        </AppText>
      </View>

      <View style={styles.chip} testID="streak-chip" accessibilityLabel={`${streakDays} day streak`}>
        <AppText variant="bodyBold" color={hasStreak ? 'coralText' : 'ink3'}>
          {hasStreak ? '🔥' : '🌱'} {streakDays}
        </AppText>
      </View>

      {/* On narrow screens the name and streak win the space; notifications live under Profile too. */}
      {!compact && (
      <View style={styles.bell}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={Colors.ink} strokeWidth={2} strokeLinecap="round">
          <Path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" />
          <Path d="M10 20a2 2 0 0 0 4 0" />
        </Svg>
        <View style={styles.dot} />
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 6, paddingBottom: 16 },
  flex: { flex: 1 },
  rowCompact: { gap: 8 },
  ringCompact: { width: 40, height: 40 },
  ring: { width: 48, height: 48, borderRadius: 24, padding: 2.5 },
  avatar: { flex: 1, borderRadius: 24, overflow: 'hidden', backgroundColor: '#FFE3D6', borderWidth: 2.5, borderColor: Colors.canvas, alignItems: 'center', justifyContent: 'center' },
  chip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.pill, paddingHorizontal: 11, paddingVertical: 6 },
  bell: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.coral, borderWidth: 2, borderColor: Colors.card },
});
