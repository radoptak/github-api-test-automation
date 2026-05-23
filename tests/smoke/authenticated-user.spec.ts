import { expect, test } from '@playwright/test';

interface AuthenticatedUserResponseBody {
  login: string;
  id: number;
  type: string;
}

const expectedUsername = process.env.GH_API_USERNAME;

if (!expectedUsername) {
  throw new Error(
    'Missing GH_API_USERNAME. Add your GitHub username to the local .env file.',
  );
}

test.describe('Authenticated user API', () => {
  test('should return profile details for the configured authenticated user', async ({ request }) => {
    const response = await request.get('/user');

    expect(response.status()).toBe(200);

    const responseBody = (await response.json()) as AuthenticatedUserResponseBody;

    expect(responseBody.login).toBe(expectedUsername);
    expect(responseBody.id).toEqual(expect.any(Number));
    expect(responseBody.id).toBeGreaterThan(0);
    expect(responseBody.type).toBe('User');
  });
});