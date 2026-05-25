import { expect, test } from '../../src/fixtures/sandbox-repository.fixture';

interface UpdatedRepositoryResponseBody {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
}

interface RetrievedUpdatedRepositoryResponseBody {
  description: string | null;
}

test.describe('Sandbox repository API', () => {
  test('should update the description of an existing private sandbox repository', async ({
    repositoryClient,
    sandboxRepository,
  }) => {
    const updatedDescription =
      'Repository description updated by automated PATCH test.';

    const updateResponse = await test.step(
      'Update the sandbox repository description',
      async () => {
        const response = await repositoryClient.updateRepositoryDescription(
          sandboxRepository.name,
          {
            description: updatedDescription,
          },
        );

        expect(response.status()).toBe(200);

        return response;
      },
    );

    await test.step('Verify updated repository details in the PATCH response', async () => {
      const responseBody =
        (await updateResponse.json()) as UpdatedRepositoryResponseBody;

      expect(responseBody.name).toBe(sandboxRepository.name);
      expect(responseBody.full_name).toBe(sandboxRepository.fullName);
      expect(responseBody.description).toBe(updatedDescription);
      expect(responseBody.private).toBe(sandboxRepository.isPrivate);
    });

    await test.step('Verify the updated description is persisted', async () => {
      const getResponse = await repositoryClient.getRepository(
        sandboxRepository.name,
      );

      expect(getResponse.status()).toBe(200);

      const responseBody =
        (await getResponse.json()) as RetrievedUpdatedRepositoryResponseBody;

      expect(responseBody.description).toBe(updatedDescription);
    });
  });
});
