import { expect, test } from '../../src/fixtures/sandbox-repository.fixture';
import { createSandboxRepositoryName } from '../../src/utils/sandbox-repository-name';

interface RepositoryLifecycleResponseBody {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
}

test.describe('Sandbox repository API', () => {
  test('should complete the full sandbox repository lifecycle', async ({
    repositoryClient,
  }) => {
    const repositoryName = createSandboxRepositoryName();
    const initialDescription =
      'Repository created for automated lifecycle test.';
    const updatedDescription =
      'Repository description updated during automated lifecycle test.';

    let repositoryWasCreated = false;
    let repositoryWasDeleted = false;

    try {
      await test.step('Create a private sandbox repository', async () => {
        const createResponse = await repositoryClient.createRepository({
          name: repositoryName,
          description: initialDescription,
          private: true,
        });

        expect(createResponse.status()).toBe(201);

        repositoryWasCreated = true;

        const responseBody =
          (await createResponse.json()) as RepositoryLifecycleResponseBody;

        expect(responseBody.name).toBe(repositoryName);
        expect(responseBody.description).toBe(initialDescription);
        expect(responseBody.private).toBe(true);
      });

      await test.step('Retrieve the created sandbox repository', async () => {
        const getResponse = await repositoryClient.getRepository(repositoryName);

        expect(getResponse.status()).toBe(200);

        const responseBody =
          (await getResponse.json()) as RepositoryLifecycleResponseBody;

        expect(responseBody.name).toBe(repositoryName);
        expect(responseBody.description).toBe(initialDescription);
        expect(responseBody.private).toBe(true);
      });

      await test.step('Update the sandbox repository description', async () => {
        const updateResponse =
          await repositoryClient.updateRepositoryDescription(repositoryName, {
            description: updatedDescription,
          });

        expect(updateResponse.status()).toBe(200);

        const responseBody =
          (await updateResponse.json()) as RepositoryLifecycleResponseBody;

        expect(responseBody.name).toBe(repositoryName);
        expect(responseBody.description).toBe(updatedDescription);
        expect(responseBody.private).toBe(true);
      });

      await test.step('Verify the updated description is persisted', async () => {
        const getResponse = await repositoryClient.getRepository(repositoryName);

        expect(getResponse.status()).toBe(200);

        const responseBody =
          (await getResponse.json()) as RepositoryLifecycleResponseBody;

        expect(responseBody.description).toBe(updatedDescription);
      });

      await test.step('Delete the sandbox repository', async () => {
        const deleteResponse =
          await repositoryClient.deleteRepository(repositoryName);

        expect(deleteResponse.status()).toBe(204);

        repositoryWasDeleted = true;
      });

      await test.step('Verify the deleted sandbox repository is no longer available', async () => {
        const getResponse = await repositoryClient.getRepository(repositoryName);

        expect(getResponse.status()).toBe(404);
      });
    } finally {
      if (repositoryWasCreated && !repositoryWasDeleted) {
        await test.step('Delete sandbox repository during fallback cleanup', async () => {
          const cleanupResponse =
            await repositoryClient.deleteRepository(repositoryName);

          expect.soft([204, 404]).toContain(cleanupResponse.status());
        });
      }
    }
  });
});