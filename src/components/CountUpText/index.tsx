import { AppText, type TextVariant } from '@/components/AppText';
import type { ColorName } from '@/constants/theme';
import { useCountUp } from '@/hooks/useCountUp';

type Props = { value: number; prefix?: string; suffix?: string; variant?: TextVariant; color?: ColorName; delay?: number };

/** Number that counts up from 0 — pairs with rings/bars so the numbers "arrive" together. */
export function CountUpText({ value, prefix = '', suffix = '', variant = 'display', color = 'ink', delay }: Props) {
  const n = useCountUp(value, { delay });
  return (
    <AppText variant={variant} color={color}>
      {prefix}
      {n}
      {suffix}
    </AppText>
  );
}
