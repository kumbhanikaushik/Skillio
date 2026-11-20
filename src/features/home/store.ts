import { useSyncExternalStore } from 'react';

import { SCENARIOS, withPracticeDone, type ScenarioKey } from './mockData';
import type { HomePayload, PracticeScore } from './types';

/**
 * Tiny in-memory store standing in for the backend.
 * Lets the practice screen mark today's practice done and the dev switcher swap scenarios.
 */
type State = { scenario: ScenarioKey; data: HomePayload };

let state: State = { scenario: 'classSoon', data: SCENARIOS.classSoon.data };
const listeners = new Set<() => void>();

const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};

export const homeStore = {
  setScenario: (scenario: ScenarioKey) => set({ scenario, data: SCENARIOS[scenario].data }),
  completePractice: (score: PracticeScore) => {
    if (!state.data.dailyPractice.completedToday) set({ ...state, data: withPracticeDone(state.data, score) });
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useHomeStore = () => useSyncExternalStore(subscribe, () => state, () => state);
