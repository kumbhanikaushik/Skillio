/** Skillio design tokens. Brand teal #08A4B3 + white, warm accents for energy. */
export const Colors = {
  teal: '#08A4B3',
  tealDeep: '#067F8B',
  tealBright: '#0BC3D3',
  tealLight: '#E6F7F9',
  tealFaint: '#F3FBFC',
  ink: '#0B2E35',
  ink2: '#4A6168',
  ink3: '#8AA0A6',
  line: '#E3EEF0',
  canvas: '#F4F9FA',
  card: '#FFFFFF',
  muted: '#EEF3F4',
  sun: '#FFC23C',
  sunDeep: '#D99A12',
  sunLight: '#FFF7E0',
  sunText: '#7A5300',
  coral: '#FF7A59',
  coralDeep: '#D85A3A',
  coralLight: '#FFF0EB',
  coralText: '#C2410C',
  mint: '#16B26B',
  mintDeep: '#0E8A51',
  mintLight: '#E5F8EE',
  violet: '#7C5CFF',
  violetDeep: '#5A3BE0',
  violetLight: '#F0ECFF',
  rose: '#F0446B',
  roseDeep: '#C32A4E',
  roseLight: '#FFE7EC',
  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof Colors;

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

export const Radius = { sm: 12, md: 16, lg: 22, xl: 26, pill: 999 } as const;

export const Fonts = {
  regular: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  heavy: 'PlusJakartaSans_800ExtraBold',
} as const;

export const Shadow = {
  card: {
    shadowColor: Colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  hero: {
    shadowColor: Colors.teal,
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

/** Content is centred and capped on web/tablets so it keeps a phone-like rhythm. */
export const MaxContentWidth = 480;
