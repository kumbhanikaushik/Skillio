import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Lays buttons side by side and lets them wrap onto their own line when the screen is too narrow
 * for every label to fit (each Button reserves a min width from its label). No breakpoints needed.
 */
export function ButtonRow({ children }: PropsWithChildren) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8 },
});
