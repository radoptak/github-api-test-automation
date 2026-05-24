import { randomUUID } from 'node:crypto';

export const SANDBOX_REPOSITORY_PREFIX = 'api-test-repo-';

export function createSandboxRepositoryName(): string {
  return `${SANDBOX_REPOSITORY_PREFIX}${randomUUID()}`;
}

export function assertSandboxRepositoryName(repositoryName: string): void {
  if (!repositoryName.startsWith(SANDBOX_REPOSITORY_PREFIX)) {
    throw new Error(
      `Refusing repository operation for "${repositoryName}". Sandbox repository names must start with "${SANDBOX_REPOSITORY_PREFIX}".`,
    );
  }
}
