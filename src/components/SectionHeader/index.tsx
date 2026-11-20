import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';

type Props = { title: string; action?: string; onAction?: () => void };

export function SectionHeader({ title, action, onAction }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <AppText variant="caption" color="teal">
            {action}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, marginBottom: 10, paddingHorizontal: 2 },
});
