import { expect, test } from '../../src/fixtures/authenticated-api.fixture';
import { GitHubSandboxRepositoryClient } from '../../src/clients/github-sandbox-repository.client';
import { requireEnvironmentVariable } from '../../src/config/environment';
import { createSandboxRepositoryName } from '../../src/utils/sandbox-repository-name';

interface CreatedRepositoryResponseBody {
  name: string;
  full_name: string;
  private: boolean;
}

const sandboxOrganization = requireEnvironmentVariable('GH_API_ORG');

test.describe('Sandbox repository API', () => {
  test('should create a private repository in the configured sandbox organization', async ({
    authenticatedRequest,
  }) => {
    const repositoryName = createSandboxRepositoryName();
    const repositoryClient = new GitHubSandboxRepositoryClient(
      authenticatedRequest,
      sandboxOrganization,
    );

    let repositoryWasCreated = false;

    try {
      const createResponse =
        await test.step('Create a private repository in the sandbox organization', async () => {
          const response = await repositoryClient.createRepository({
            name: repositoryName,
            description: 'Repository created by automated API test.',
            private: true,
          });

          expect(response.status()).toBe(201);

          repositoryWasCreated = true;

          return response;
        });

      await test.step('Verify created repository details', async () => {
        const responseBody =
          (await createResponse.json()) as CreatedRepositoryResponseBody;

        expect(responseBody.name).toBe(repositoryName);
        expect(responseBody.full_name).toBe(
          `${sandboxOrganization}/${repositoryName}`,
        );
        expect(responseBody.private).toBe(true);
      });
    } finally {
      await test.step('Delete sandbox repository during cleanup', async () => {
        const deleteResponse =
          await repositoryClient.deleteRepository(repositoryName);

        if (repositoryWasCreated) {
          expect.soft(deleteResponse.status()).toBe(204);
        } else {
          expect.soft([204, 404]).toContain(deleteResponse.status());
        }
      });
    }
  });
});
