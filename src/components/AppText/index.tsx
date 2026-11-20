import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts, type ColorName } from '@/constants/theme';

const VARIANTS = StyleSheet.create({
  display: { fontFamily: Fonts.heavy, fontSize: 26, lineHeight: 30 },
  title: { fontFamily: Fonts.heavy, fontSize: 20, lineHeight: 26 },
  heading: { fontFamily: Fonts.heavy, fontSize: 17, lineHeight: 22 },
  subheading: { fontFamily: Fonts.heavy, fontSize: 15.5, lineHeight: 21 },
  body: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 19 },
  bodyBold: { fontFamily: Fonts.bold, fontSize: 13.5, lineHeight: 19 },
  caption: { fontFamily: Fonts.semibold, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: Fonts.heavy, fontSize: 11.5, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
});

export type TextVariant = keyof typeof VARIANTS;

type Props = TextProps & { variant?: TextVariant; color?: ColorName; center?: boolean };

/** Single typography primitive: every piece of text in the app goes through this. */
export function AppText({ variant = 'body', color = 'ink', center, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[VARIANTS[variant], { color: Colors[color] }, center && { textAlign: 'center' }, style]}
    />
  );
}
