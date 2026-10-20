import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // content.ts, content.config.ts and media.ts only wire Astro's content and asset loaders to the tested schemas and guards;
      // the build and e2e tests exercise them.
      exclude: [
        'src/**/*.test.ts',
        'src/lib/content.ts',
        'src/content.config.ts',
        'src/lib/media.ts',
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
