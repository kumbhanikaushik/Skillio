import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Colors, Radius, type ColorName } from '@/constants/theme';

type Props = { emoji: string; tint: ColorName; title: string; body: string };

/** Emoji tile + title + one-line reason. Every empty/edge state uses this so they read consistently. */
export function EmptyState({ emoji, tint, title, body }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.art, { backgroundColor: Colors[tint] }]}>
        <AppText style={styles.emoji}>{emoji}</AppText>
      </View>
      <View style={styles.text}>
        <AppText variant="subheading">{title}</AppText>
        <AppText color="ink2" style={styles.body}>
          {body}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  art: { width: 60, height: 60, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30, lineHeight: 36 },
  text: { flex: 1 },
  body: { marginTop: 3 },
});
