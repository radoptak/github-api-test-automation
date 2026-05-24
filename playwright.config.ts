import { defineConfig } from '@playwright/test';
import { requireEnvironmentVariable } from './src/config/environment';

const apiToken = requireEnvironmentVariable('GH_API_TOKEN');

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
