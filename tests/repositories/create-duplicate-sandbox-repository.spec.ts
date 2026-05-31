import { expect, test } from '../../src/fixtures/sandbox-repository.fixture';
import { createSandboxRepositoryName } from '../../src/utils/sandbox-repository-name';

test.describe('Sandbox repository API', () => {
  test('should return 422 when creating a duplicate sandbox repository', async ({
    repositoryClient,
  }) => {
    const repositoryName = createSandboxRepositoryName();
    let repositoryWasCreated = false;

    try {
      await test.step('Create an initial private sandbox repository', async () => {
        const createResponse = await repositoryClient.createRepository({
          name: repositoryName,
          description: 'Repository created for duplicate creation test.',
          private: true,
        });

        expect(createResponse.status()).toBe(201);

        repositoryWasCreated = true;
      });

      await test.step('Try to create a duplicate sandbox repository', async () => {
        const duplicateCreateResponse = await repositoryClient.createRepository({
          name: repositoryName,
          description: 'Duplicate repository creation attempt.',
          private: true,
        });

        expect(duplicateCreateResponse.status()).toBe(422);
      });
    } finally {
      if (repositoryWasCreated) {
        await test.step('Delete sandbox repository during cleanup', async () => {
          const cleanupResponse =
            await repositoryClient.deleteRepository(repositoryName);

          expect.soft([204, 404]).toContain(cleanupResponse.status());
        });
      }
    }
  });
});