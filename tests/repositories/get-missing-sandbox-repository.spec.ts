import { expect, test } from '../../src/fixtures/sandbox-repository.fixture';
import { createSandboxRepositoryName } from '../../src/utils/sandbox-repository-name';

test.describe('Sandbox repository API', () => {
  test('should return 404 for a missing sandbox repository', async ({
    repositoryClient,
  }) => {
    const missingRepositoryName = createSandboxRepositoryName();

    await test.step('Try to retrieve a missing sandbox repository', async () => {
      const response = await repositoryClient.getRepository(
        missingRepositoryName,
      );

      expect(response.status()).toBe(404);
    });
  });
});
