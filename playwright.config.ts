import { defineConfig, devices } from '@playwright/test';

// Not Astro's default 4321, so a dev server from another project is never reused by mistake.
const PORT = 4417;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'on-first-retry' },
  // Launch QA matrix (task 2.3.1): Safari's engine on iPhone and iPad, Chrome on Android and two
  // laptop widths, with two of the five in dark mode.
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 15'], colorScheme: 'dark' } },
    { name: 'pixel', use: { ...devices['Pixel 8'] } },
    { name: 'ipad', use: { ...devices['iPad (gen 11)'] } },
    {
      name: 'laptop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        colorScheme: 'dark',
      },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // --ignore-lock keeps astro preview in the foreground; Astro 7 backgrounds it when an agent runs it.
    command: `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
