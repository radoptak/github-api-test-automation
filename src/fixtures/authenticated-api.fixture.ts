import { expect, test as base } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { requireEnvironmentVariable } from '../config/environment';

interface AuthenticatedApiFixtures {
  authenticatedRequest: APIRequestContext;
}

export const test = base.extend<AuthenticatedApiFixtures>({
  authenticatedRequest: async ({ playwright }, use) => {
    const apiToken = requireEnvironmentVariable('GH_API_TOKEN');

    const authenticatedRequest = await playwright.request.newContext({
      baseURL: 'https://api.github.com',
      extraHTTPHeaders: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${apiToken}`,
        'X-GitHub-Api-Version': '2026-03-10',
      },
    });

    await use(authenticatedRequest);

    await authenticatedRequest.dispose();
  },
});

export { expect };
