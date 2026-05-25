export interface CreateSandboxRepositoryRequestBody {
  name: string;
  description: string;
  private: true;
}

export interface UpdateSandboxRepositoryDescriptionRequestBody {
  description: string;
}
