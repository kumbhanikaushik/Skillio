import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { AppText } from '@/components';
import { Colors, MaxContentWidth } from '@/constants/theme';

const ICONS = {
  Home: (c: string) => <Path d="M12 3 3 10v10a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V10z" fill={c} />,
  Learn: (c: string) => <Path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2zM4 21V5" stroke={c} strokeWidth={2} fill="none" strokeLinejoin="round" />,
  Classes: (c: string) => (
    <>
      <Rect x={3} y={5} width={18} height={16} rx={3} stroke={c} strokeWidth={2} fill="none" />
      <Path d="M3 10h18M8 3v4M16 3v4" stroke={c} strokeWidth={2} />
    </>
  ),
  Profile: (c: string) => (
    <>
      <Circle cx={12} cy={8} r={4} stroke={c} strokeWidth={2} fill="none" />
      <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke={c} strokeWidth={2} fill="none" />
    </>
  ),
};

/** Visual bottom navigation for the home screen (other tabs are out of scope for this task). */
export function HomeTabBar() {
  const { bottom } = useSafeAreaInsets();
  return (
    <View testID="tab-bar" style={[styles.bar, { paddingBottom: Math.max(bottom, 12) }]} accessibilityRole="tablist">
      <View style={styles.inner}>
      {(Object.keys(ICONS) as (keyof typeof ICONS)[]).map((name, i) => {
        const color = i === 0 ? Colors.teal : Colors.ink3;
        return (
          <View key={name} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: i === 0 }}>
            <Svg width={24} height={24} viewBox="0 0 24 24">{ICONS[name](color)}</Svg>
            <AppText variant="caption" style={{ color, fontSize: 11 }}>{name}</AppText>
          </View>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingTop: 10, backgroundColor: 'rgba(255,255,255,0.97)', borderTopWidth: 1, borderColor: Colors.line },
  // tabs stay grouped under the centred content on tablets/desktop instead of spreading edge to edge
  inner: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  tab: { alignItems: 'center', gap: 4, minWidth: 64 },
});
