import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PulseDot } from '@/components/PulseDot';
import { Colors, Radius, type ColorName } from '@/constants/theme';

const TONES = {
  teal: ['tealLight', 'tealDeep'],
  live: ['roseLight', 'rose'],
  sun: ['sunLight', 'sunText'],
  coral: ['coralLight', 'coralText'],
  mint: ['mintLight', 'mintDeep'],
  violet: ['violetLight', 'violetDeep'],
  grey: ['muted', 'ink2'],
} as const satisfies Record<string, readonly [ColorName, ColorName]>;

export type BadgeTone = keyof typeof TONES;

type Props = { label: string; tone?: BadgeTone; live?: boolean; testID?: string };

export function Badge({ label, tone = 'teal', live, testID }: Props) {
  const [bg, fg] = TONES[tone];
  return (
    <View testID={testID} style={[styles.badge, { backgroundColor: Colors[bg] }]}>
      {live && <PulseDot color={Colors.rose} />}
      <AppText variant="caption" color={fg} style={styles.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11.5 },
});
