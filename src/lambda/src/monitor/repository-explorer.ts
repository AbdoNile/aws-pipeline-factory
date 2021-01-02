import { ISourceControlClient } from './github-client';
import { Repository } from './models';
export class RepositoryExplorer {
  constructor(private client: ISourceControlClient) {}

  public async getRepository(owner: string, repositoryName: string): Promise<Repository> {
    return await this.client.getRepository(owner, repositoryName);
  }

  public async listRepositories(organization: string): Promise<{ name: string; owner: string; id: string }[]> {
    const repos = await await this.client.findRepositories(organization); //.filter((f) => f.name == 'pipeline-factory');
    return repos;
  }
}
