import lambda from 'aws-lambda';

import { CloudFormationManager } from './cloudformation-manager';
import { GithubClient } from './github-client';
import { DiscoveryJob, RepositoryBuildConfiguration } from './models';
import { OrganizationManager } from './organization-manager';
import { PipelineCoordinator } from './pipeline-coordinator';
import { RepositoryExplorer } from './repository-explorer';

export class PipelineManagementHandler {
  constructor(private factoryCodeBuildProjectName: string) {}
  public handler = async (event: lambda.SQSEvent): Promise<void> => {
    try {
      await Promise.all(
        event.Records.map(async (sqsMessage) => {
          const job = <DiscoveryJob>JSON.parse(sqsMessage.body);
          console.debug(`SQS Payload ${JSON.stringify(job, null, 4)}`);
          console.debug(`Try to get Organization Info for  ${JSON.stringify(job.owner, null, 4)}`);
          const organizationManager = new OrganizationManager();
          const organizationInfo = await organizationManager.get(job.owner);
          console.debug(`Retrieved Information for org ${JSON.stringify(organizationInfo.name, null, 4)}`);
          console.debug(
            `Retrieved Information for token ${JSON.stringify(organizationInfo.githubToken.substring(0, 5), null, 4)}`,
          );

          const githubClient = new GithubClient(organizationInfo.githubToken);
          const cloudFormationManager = new CloudFormationManager(this.factoryCodeBuildProjectName);
          const repositoryExplorer = new RepositoryExplorer(githubClient);
          const coordinator = new PipelineCoordinator(cloudFormationManager);
          const repository = await repositoryExplorer.getRepository(job.owner, job.name);
          console.debug(JSON.stringify(repository, null, 4));
          const existingBranches = await cloudFormationManager.getBranchesWithStacks(repository.owner, repository.name);
          const configuration = new RepositoryBuildConfiguration(repository, existingBranches);
          console.debug(JSON.stringify(configuration, null, 4));
          await coordinator.createNewPipelines(configuration);
          await coordinator.cleanObsoletePipelines(configuration);
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };
}

if (!process.env.FACTORY_CODEBUILD_PROJECT_NAME) {
  throw new Error(`process.env.FACTORY_CODEBUILD_PROJECT_NAME is not provided`);
}

export const handler = new PipelineManagementHandler(process.env.FACTORY_CODEBUILD_PROJECT_NAME).handler;
