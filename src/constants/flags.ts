/**
 * Demo-state switcher: always on in development, and on in the "demo" release build
 * (EAS `preview` profile sets EXPO_PUBLIC_DEMO=1) so reviewers can see every state on a real APK.
 */
export const SHOW_DEMO_SWITCHER = __DEV__ || process.env.EXPO_PUBLIC_DEMO === '1';
