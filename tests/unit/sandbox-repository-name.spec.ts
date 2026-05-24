import { expect, test } from '@playwright/test';
import {
  assertSandboxRepositoryName,
  createSandboxRepositoryName,
  SANDBOX_REPOSITORY_PREFIX,
} from '../../src/utils/sandbox-repository-name';

test.describe('Sandbox repository name utility', () => {
  test('should generate repository name with the sandbox prefix', () => {
    const repositoryName = createSandboxRepositoryName();

    expect(repositoryName).toMatch(
      new RegExp(`^${SANDBOX_REPOSITORY_PREFIX}[0-9a-f-]+$`),
    );
  });

  test('should accept repository name with the sandbox prefix', () => {
    const repositoryName = createSandboxRepositoryName();

    expect(() => assertSandboxRepositoryName(repositoryName)).not.toThrow();
  });

  test('should reject repository name without the sandbox prefix', () => {
    expect(() =>
      assertSandboxRepositoryName('important-manual-repository'),
    ).toThrow(
      `Sandbox repository names must start with "${SANDBOX_REPOSITORY_PREFIX}".`,
    );
  });
});
