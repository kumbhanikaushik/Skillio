import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { SCENARIOS, type ScenarioKey } from '@/features/home/mockData';
import { homeStore } from '@/features/home/store';
import { HomeScreen } from '@/screens/Authenticated/Home/HomeScreen';

export default function Index() {
  // `/?state=noLessons` deep-links a demo scenario (used by Playwright screenshots).
  const { state } = useLocalSearchParams<{ state?: string }>();
  useEffect(() => {
    if (state && state in SCENARIOS) homeStore.setScenario(state as ScenarioKey);
  }, [state]);

  return <HomeScreen />;
}
