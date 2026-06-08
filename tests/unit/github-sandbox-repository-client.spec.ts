import { expect, test, type APIRequestContext } from '@playwright/test';
import { GitHubSandboxRepositoryClient } from '../../src/clients/github-sandbox-repository.client';

const unsafeRepositoryName = 'production-repository';
const sandboxOrganization = 'sandbox-organization';

function createApiRequestSpy(onRequest: () => void): APIRequestContext {
  const failIfCalled = async () => {
    onRequest();

    throw new Error(
      'API request should not be sent for unsafe repository names.',
    );
  };

  return {
    post: failIfCalled,
    get: failIfCalled,
    patch: failIfCalled,
    delete: failIfCalled,
  } as unknown as APIRequestContext;
}

test.describe('GitHub sandbox repository client safety guard', () => {
  test('should block unsafe repository name before sending create request', async () => {
    let apiRequestWasSent = false;

    const request = createApiRequestSpy(() => {
      apiRequestWasSent = true;
    });

    const repositoryClient = new GitHubSandboxRepositoryClient(
      request,
      sandboxOrganization,
    );

    await expect(
      repositoryClient.createRepository({
        name: unsafeRepositoryName,
        description: 'Unsafe repository creation attempt.',
        private: true,
      }),
    ).rejects.toThrow();

    expect(apiRequestWasSent).toBe(false);
  });

  test('should block unsafe repository name before sending get request', async () => {
    let apiRequestWasSent = false;

    const request = createApiRequestSpy(() => {
      apiRequestWasSent = true;
    });

    const repositoryClient = new GitHubSandboxRepositoryClient(
      request,
      sandboxOrganization,
    );

    await expect(
      repositoryClient.getRepository(unsafeRepositoryName),
    ).rejects.toThrow();

    expect(apiRequestWasSent).toBe(false);
  });

  test('should block unsafe repository name before sending update request', async () => {
    let apiRequestWasSent = false;

    const request = createApiRequestSpy(() => {
      apiRequestWasSent = true;
    });

    const repositoryClient = new GitHubSandboxRepositoryClient(
      request,
      sandboxOrganization,
    );

    await expect(
      repositoryClient.updateRepositoryDescription(unsafeRepositoryName, {
        description: 'Unsafe repository update attempt.',
      }),
    ).rejects.toThrow();

    expect(apiRequestWasSent).toBe(false);
  });

  test('should block unsafe repository name before sending delete request', async () => {
    let apiRequestWasSent = false;

    const request = createApiRequestSpy(() => {
      apiRequestWasSent = true;
    });

    const repositoryClient = new GitHubSandboxRepositoryClient(
      request,
      sandboxOrganization,
    );

    await expect(
      repositoryClient.deleteRepository(unsafeRepositoryName),
    ).rejects.toThrow();

    expect(apiRequestWasSent).toBe(false);
  });
});
