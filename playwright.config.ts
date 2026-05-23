import dotenv from 'dotenv';
import { defineConfig } from '@playwright/test';

dotenv.config({ quiet: true });

const apiToken = process.env.GH_API_TOKEN;

if (!apiToken) {
  throw new Error(
    'Missing GH_API_TOKEN. Create a local .env file based on .env.example before running API tests.',
  );
}

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'https://api.github.com',
    extraHTTPHeaders: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${apiToken}`,
      'X-GitHub-Api-Version': '2026-03-10',
    },
  },
});
