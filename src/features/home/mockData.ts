import type { HomePayload, PracticeScore } from './types';

const SCORE: PracticeScore = { correct: 9, total: 10, xpEarned: 40, wordsLearned: 6, minutesSpent: 7 };

const base: HomePayload = {
  user: { name: 'Aarav', avatarUrl: 'https://i.pravatar.cc/200?img=12' },
  subscription: { tier: 'Pro', lessonsRemaining: 7, totalLessons: 12, status: 'active', renewsOn: 'Dec 1' },
  scheduledClass: {
    time: 'Today · 5:30 PM',
    teacher: 'Ms. Priya Shah',
    subject: 'Speaking · Giving opinions',
    startsInMin: 25,
    durationMin: 45,
    isLive: false,
  },
  progress: { currentCefrLevel: 'B1', nextCefrLevel: 'B2', overallProgressPercent: 64, lessonsToNextLevel: 9 },
  skillSnapshot: {
    grammar: 72,
    vocabulary: 81,
    pronunciation: 58,
    speaking: 63,
    overallImprovementPercent: 18,
    growthPercent: 6,
    lastCheckIn: 'Nov 12',
  },
  dailyPractice: {
    completedToday: false,
    streakDays: 12,
    week: [true, true, true, true, false, true, null],
    tasks: [
      { emoji: '📖', label: 'Read' },
      { emoji: '🎧', label: 'Listen' },
      { emoji: '🗣️', label: 'Speak' },
    ],
    estimatedMinutes: 8,
    xpReward: 40,
    score: null,
  },
};

type Patch = (d: HomePayload) => void;
const make = (patch: Patch): HomePayload => {
  const d = structuredClone(base);
  patch(d);
  return d;
};

/** Marks today's practice as done (used by scenarios and after finishing a session). */
export const withPracticeDone = (d: HomePayload, score: PracticeScore = SCORE): HomePayload => ({
  ...d,
  dailyPractice: { ...d.dailyPractice, completedToday: true, streakDays: d.dailyPractice.streakDays + 1, score },
});

export const SCENARIOS = {
  classSoon: { label: 'Class soon', emoji: '📅', hint: 'Countdown + Join', data: base },
  noClassDone: {
    label: 'No class · done',
    emoji: '✅',
    hint: 'Book + results',
    data: withPracticeDone(make((d) => { d.scheduledClass = null; })),
  },
  live: {
    label: 'Class LIVE',
    emoji: '🔴',
    hint: 'Pulsing join',
    data: withPracticeDone(
      make((d) => { d.scheduledClass = { ...d.scheduledClass!, isLive: true, startsInMin: 0, time: 'Now · 5:30 PM' }; }),
      { correct: 7, total: 10, xpEarned: 30, wordsLearned: 4, minutesSpent: 9 },
    ),
  },
  newStudent: {
    label: 'New student',
    emoji: '🌱',
    hint: 'No skill data',
    data: make((d) => {
      d.user = { name: 'Meera', avatarUrl: null }; // no photo yet → initial
      d.scheduledClass = null;
      d.skillSnapshot = null;
      d.progress = { currentCefrLevel: 'A2', nextCefrLevel: 'B1', overallProgressPercent: 0, lessonsToNextLevel: 14 };
      d.subscription!.lessonsRemaining = 12;
      d.dailyPractice.streakDays = 0;
      d.dailyPractice.week = [false, false, false, false, false, false, null];
    }),
  },
  noLessons: {
    label: 'No lessons',
    emoji: '🎟️',
    hint: 'Booking locked',
    data: make((d) => {
      d.scheduledClass = null;
      d.subscription!.lessonsRemaining = 0;
      d.dailyPractice.streakDays = 4;
      d.dailyPractice.week = [false, false, true, true, true, true, null];
    }),
  },
  noSubscription: {
    label: 'No plan',
    emoji: '🆓',
    hint: 'Free-trial upsell',
    data: withPracticeDone(
      make((d) => {
        d.subscription = null;
        d.scheduledClass = null;
        d.dailyPractice.streakDays = 2;
        d.dailyPractice.week = [false, false, false, false, true, true, null];
      }),
      { correct: 8, total: 10, xpEarned: 35, wordsLearned: 5, minutesSpent: 6 },
    ),
  },
  expired: {
    label: 'Plan expired',
    emoji: '⏳',
    hint: 'Renew card',
    data: make((d) => {
      d.scheduledClass = null;
      d.subscription = { tier: 'Pro', lessonsRemaining: 0, totalLessons: 12, status: 'expired', renewsOn: null, expiredOn: 'Nov 15' };
    }),
  },
} satisfies Record<string, { label: string; emoji: string; hint: string; data: HomePayload }>;

export type ScenarioKey = keyof typeof SCENARIOS;
export const SCENARIO_KEYS = Object.keys(SCENARIOS) as ScenarioKey[];
