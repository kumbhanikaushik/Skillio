import { defineConfig } from '@playwright/test';

/**
 * Live tests on running Android emulators (the real native app, not the web build).
 * Prereqs: emulators booted, the debug app installed, and Metro running:  npx expo start --port 8083
 * Run:     npm run test:native
 * One project per emulator; each runs serially on its own device, emulators run in parallel.
 */
const EMULATORS = {
  'small-phone-360dp': 'emulator-5558',
  'pixel-3a-393dp': 'emulator-5554',
  'pixel-9a-411dp': 'emulator-5556',
};

export default defineConfig({
  testDir: './e2e/native',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: Object.keys(EMULATORS).length,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report-native' }]],
  projects: Object.entries(EMULATORS).map(([name, serial]) => ({ name, metadata: { serial } })),
});
