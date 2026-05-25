import { test as authenticatedTest, expect } from './authenticated-api.fixture';
import { GitHubSandboxRepositoryClient } from '../clients/github-sandbox-repository.client';
import { requireEnvironmentVariable } from '../config/environment';
import { createSandboxRepositoryName } from '../utils/sandbox-repository-name';

interface SandboxRepositoryFixtureData {
  name: string;
  fullName: string;
  description: string;
  isPrivate: true;
}

interface SandboxRepositoryFixtures {
  repositoryClient: GitHubSandboxRepositoryClient;
  sandboxRepository: SandboxRepositoryFixtureData;
}

const sandboxOrganization = requireEnvironmentVariable('GH_API_ORG');

export const test = authenticatedTest.extend<SandboxRepositoryFixtures>({
  repositoryClient: async ({ authenticatedRequest }, use) => {
    const repositoryClient = new GitHubSandboxRepositoryClient(
      authenticatedRequest,
      sandboxOrganization,
    );

    await use(repositoryClient);
  },

  sandboxRepository: async ({ repositoryClient }, use) => {
    const repositoryName = createSandboxRepositoryName();
    const repositoryDescription =
      'Repository created as automated test fixture.';

    let repositoryWasCreated = false;

    try {
      const createResponse = await repositoryClient.createRepository({
        name: repositoryName,
        description: repositoryDescription,
        private: true,
      });

      expect(createResponse.status()).toBe(201);

      repositoryWasCreated = true;

      await use({
        name: repositoryName,
        fullName: `${sandboxOrganization}/${repositoryName}`,
        description: repositoryDescription,
        isPrivate: true,
      });
    } finally {
      const deleteResponse =
        await repositoryClient.deleteRepository(repositoryName);

      if (repositoryWasCreated) {
        expect.soft(deleteResponse.status()).toBe(204);
      } else {
        expect.soft([204, 404]).toContain(deleteResponse.status());
      }
    }
  },
});

export { expect };
