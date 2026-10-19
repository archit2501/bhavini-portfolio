// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL becomes her own domain in task 2.3.2.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://archit2501.github.io',
  output: 'static',
});
