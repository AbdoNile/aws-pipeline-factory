import { CloudFormationManager } from './cloudformation-manager';
import { ISourceControlClient } from './github-client';
import { Branch, Repository, RepositoryBuildConfiguration } from './models';
export class RepositoryExplorer {
  constructor(private client: ISourceControlClient, private cloudFormationManager: CloudFormationManager) {}

  public async findSubscribedRepositories(organization: string): Promise<Repository[]> {
    const repos = await this.client.findSubscribedRepositories(organization);
    return repos.map((r) => new Repository(r.owner, r.repositoryName, r.defaultBranch));
  }

  public async getRepositoryBuildConfiguration(repo: Repository): Promise<RepositoryBuildConfiguration> {
    const repositoryBranches = await this.client.findBranches(repo.owner, repo.name);
    const branches = repositoryBranches.map((b) => new Branch(b.branchName, b.commitSha));
    const settingsFile = await this.client.getPipelineFactorySettings(repo.owner, repo.name, repo.defaultBranch);
    const existingPipelines = await this.cloudFormationManager.findPipelineStacksForRepository(repo.owner, repo.name);
    const branchesWithPipelines = existingPipelines.map((s) => s.branchName);
    const repositoryBuildConfiguration = new RepositoryBuildConfiguration(
      repo,
      branches,
      settingsFile,
      branchesWithPipelines,
    );
    return repositoryBuildConfiguration;
  }
}
