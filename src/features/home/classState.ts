import type { HomePayload } from './types';

export type ClassState = 'live' | 'upcoming' | 'noSubscription' | 'expired' | 'noLessons' | 'book';

/** One place that decides which class card to show — the priority order is the product decision. */
export function getClassState({ scheduledClass: c, subscription: s }: HomePayload): ClassState {
  if (c?.isLive) return 'live';
  if (c) return 'upcoming';
  if (!s) return 'noSubscription';
  if (s.status === 'expired') return 'expired';
  if (s.lessonsRemaining === 0) return 'noLessons';
  return 'book';
}
