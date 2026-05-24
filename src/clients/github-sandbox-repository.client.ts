import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { CreateSandboxRepositoryRequestBody } from '../types/github-repository.types';
import { assertSandboxRepositoryName } from '../utils/sandbox-repository-name';

export class GitHubSandboxRepositoryClient {
  public constructor(
    private readonly request: APIRequestContext,
    private readonly organization: string,
  ) {}

  public async createRepository(
    requestBody: CreateSandboxRepositoryRequestBody,
  ): Promise<APIResponse> {
    assertSandboxRepositoryName(requestBody.name);

    return this.request.post(
      `/orgs/${encodeURIComponent(this.organization)}/repos`,
      {
        data: requestBody,
      },
    );
  }

  public async deleteRepository(repositoryName: string): Promise<APIResponse> {
    assertSandboxRepositoryName(repositoryName);

    return this.request.delete(
      `/repos/${encodeURIComponent(this.organization)}/${encodeURIComponent(repositoryName)}`,
    );
  }
}
