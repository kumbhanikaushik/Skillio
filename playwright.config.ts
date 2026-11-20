import { defineConfig, devices, type Project } from '@playwright/test';

const PORT = 8877; // 8081 is often taken by other local Expo projects

/**
 * Device matrix for the responsive suite — from the narrowest foldable to desktop.
 * Everything runs in the installed Chrome with each device's viewport, DPR, touch and mobile UA.
 */
const DEVICES: Record<string, Project['use']> = {
  'galaxy-fold-280': { ...devices['Galaxy S8'], viewport: { width: 280, height: 653 } },
  'iphone-se-320': devices['iPhone SE'],
  'galaxy-s8-360': devices['Galaxy S8'],
  'iphone-8-375': devices['iPhone 8'],
  'iphone-14-390': devices['iPhone 14'],
  'pixel-7-412': devices['Pixel 7'],
  'iphone-14-pro-max-430': devices['iPhone 14 Pro Max'],
  'iphone-14-landscape': devices['iPhone 14 landscape'],
  'ipad-mini-768': devices['iPad Mini'],
  'ipad-pro-landscape': devices['iPad Pro 11 landscape'],
  'desktop-1280': devices['Desktop Chrome'],
};

const chrome = { browserName: 'chromium' as const, channel: 'chrome' };

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 3,
  retries: 1, // the Metro dev server can be slow under parallel load; a real layout bug fails both attempts
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    // Behaviour + submission screenshots on one reference phone.
    { name: 'functional', testMatch: /(home|screenshots)\.spec\.ts/, use: { ...devices['iPhone 14'], ...chrome } },
    // Layout checks on every device size.
    ...Object.entries(DEVICES).map(([name, use]) => ({ name, testMatch: /responsive\.spec\.ts/, use: { ...use, ...chrome } })),
  ],
  webServer: {
    command: `CI=1 npx expo start --web --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
