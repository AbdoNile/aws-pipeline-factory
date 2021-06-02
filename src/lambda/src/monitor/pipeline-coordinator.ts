import { CloudFormationManager } from './cloudformation-manager';
import { RepositoryBuildConfiguration } from './repository-build-configuration';

export class PipelineCoordinator {
  constructor(private cloudFormationManager: CloudFormationManager, private repositorySelector: string) {}

  async createNewPipelines(buildConfigurations: RepositoryBuildConfiguration): Promise<void> {
    if (!buildConfigurations.shouldBeMonitored(this.repositorySelector)) {
      console.log('repository is not configured for monitoring , skipping');
      return;
    }

    const newBranches = buildConfigurations.branchesToAdd();
    await Promise.all(
      newBranches.map(async (branch) => {
        console.log(`creating ${JSON.stringify(branch, null, 4)}`);

        return await this.cloudFormationManager.createPipeline(buildConfigurations, branch.branchName);
      }),
    );
  }

  async cleanObsoletePipelines(buildConfigurations: RepositoryBuildConfiguration): Promise<void> {
    const obsoleteBranches = buildConfigurations.obsoletePipelines();

    await Promise.all(
      obsoleteBranches.map((branch) => {
        console.log(`deleting ${JSON.stringify(branch, null, 4)}`);
        return this.cloudFormationManager.deletePipeLineStack(
          buildConfigurations.repository.owner,
          buildConfigurations.repository.name,
          branch.branchName,
        );
      }),
    );
  }
}
