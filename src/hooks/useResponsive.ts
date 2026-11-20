import { useWindowDimensions } from 'react-native';

/**
 * One source of truth for size-based tweaks.
 * `compact` = narrow phones / folded foldables (< 360pt) where fixed-size art must shrink.
 */
export function useResponsive() {
  const { width } = useWindowDimensions();
  return { width, compact: width < 360 };
}
