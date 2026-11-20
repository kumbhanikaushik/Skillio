import { useReducedMotion } from 'react-native-reanimated';

/**
 * Honour the system "Remove animations" / "Reduce motion" setting for layout animations
 * (entering / exiting / layout transitions). Returns `undefined` when motion is reduced, so views
 * simply appear in their final state — the accessible behaviour for people who turn motion off.
 */
export function useMotion() {
  const reduced = useReducedMotion();
  return <T,>(animation: T): T | undefined => (reduced ? undefined : animation);
}
