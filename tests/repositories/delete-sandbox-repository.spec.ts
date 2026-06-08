import { expect, test } from '../../src/fixtures/sandbox-repository.fixture';
import { createSandboxRepositoryName } from '../../src/utils/sandbox-repository-name';

test.describe('Sandbox repository API', () => {
  test('should delete an existing private sandbox repository', async ({
    repositoryClient,
  }) => {
    const repositoryName = createSandboxRepositoryName();
    let repositoryWasDeleted = false;

    try {
      await test.step('Prepare a private sandbox repository for deletion', async () => {
        const createResponse = await repositoryClient.createRepository({
          name: repositoryName,
          description: 'Repository created for automated DELETE test.',
          private: true,
        });

        expect(createResponse.status()).toBe(201);
      });

      await test.step('Delete the existing sandbox repository', async () => {
        const deleteResponse =
          await repositoryClient.deleteRepository(repositoryName);

        expect(deleteResponse.status()).toBe(204);

        repositoryWasDeleted = true;
      });

      await test.step('Verify the deleted sandbox repository is no longer available', async () => {
        const getResponse =
          await repositoryClient.getRepository(repositoryName);

        expect(getResponse.status()).toBe(404);
      });
    } finally {
      if (!repositoryWasDeleted) {
        await test.step('Delete sandbox repository during fallback cleanup', async () => {
          const cleanupResponse =
            await repositoryClient.deleteRepository(repositoryName);

          expect.soft([204, 404]).toContain(cleanupResponse.status());
        });
      }
    }
  });
});
