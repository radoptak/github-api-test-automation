import { expect, test } from '../../src/fixtures/sandbox-repository.fixture';

interface RetrievedRepositoryResponseBody {
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
}

test.describe('Sandbox repository API', () => {
  test('should return an existing private sandbox repository', async ({
    repositoryClient,
    sandboxRepository,
  }) => {
    const getResponse = await test.step(
      'Retrieve an existing private sandbox repository',
      async () => {
        const response = await repositoryClient.getRepository(
          sandboxRepository.name,
        );

        expect(response.status()).toBe(200);

        return response;
      },
    );

    await test.step('Verify retrieved repository details', async () => {
      const responseBody =
        (await getResponse.json()) as RetrievedRepositoryResponseBody;

      expect(responseBody.name).toBe(sandboxRepository.name);
      expect(responseBody.full_name).toBe(sandboxRepository.fullName);
      expect(responseBody.description).toBe(sandboxRepository.description);
      expect(responseBody.private).toBe(sandboxRepository.isPrivate);
    });
  });
});
