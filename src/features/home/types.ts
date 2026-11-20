/**
 * Home payload. Field names from the brief are kept exactly.
 * Fields marked `+` were added for the design (documented in README "Added fields").
 */
export type SubscriptionStatus = 'active' | 'expired';

export interface Subscription {
  tier: string;
  lessonsRemaining: number;
  totalLessons: number;
  /** + plan state, drives the "expired" edge state */
  status: SubscriptionStatus;
  /** + when lessons refill */
  renewsOn: string | null;
  /** + when an expired plan ended */
  expiredOn?: string;
}

export interface ScheduledClass {
  time: string;
  teacher: string;
  subject: string;
  /** + powers the live countdown */
  startsInMin: number;
  /** + shown next to the teacher */
  durationMin: number;
  /** + switches the card into its LIVE state */
  isLive: boolean;
}

export interface Progress {
  currentCefrLevel: CefrLevel;
  nextCefrLevel: CefrLevel;
  overallProgressPercent: number;
  /** + turns the % into a concrete goal */
  lessonsToNextLevel: number;
}

export interface SkillSnapshot {
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  speaking: number;
  overallImprovementPercent: number;
  growthPercent: number;
  /** + context for growthPercent */
  lastCheckIn: string;
}

export interface PracticeTask {
  emoji: string;
  label: string;
}

export interface PracticeScore {
  correct: number;
  total: number;
  xpEarned: number;
  wordsLearned: number;
  minutesSpent: number;
}

/** null = today, true = practised, false = missed (Mon → Sun) */
export type WeekDay = boolean | null;

export interface DailyPractice {
  completedToday: boolean;
  /** + streak chip and habit loop */
  streakDays: number;
  /** + 7-day flame strip */
  week: WeekDay[];
  /** + "Start" state: what is inside today's mix */
  tasks: PracticeTask[];
  estimatedMinutes: number;
  xpReward: number;
  /** + "View results" state */
  score: PracticeScore | null;
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface HomePayload {
  user: { name: string; avatarUrl: string | null };
  /** null = no active subscription */
  subscription: Subscription | null;
  /** null = no class scheduled */
  scheduledClass: ScheduledClass | null;
  progress: Progress;
  /** null = no skill data yet (brand-new student) */
  skillSnapshot: SkillSnapshot | null;
  dailyPractice: DailyPractice;
}
