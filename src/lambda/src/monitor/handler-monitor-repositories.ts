import AWS from 'aws-sdk';

import { CloudFormationManager } from './cloudformation-manager';
import { GithubClient } from './github-client';
import { JobScheduler } from './JobScheduler';
import { OrganizationManager } from './organization-manager';
import { PipelineCoordinator } from './pipeline-coordinator';
import { RepositoryExplorer } from './repository-explorer';

export class MonitorRepositoriesHandlerProps {
  queueUrl: string;
  organizationName: string;
}

export class MonitorRepositoriesHandler {
  constructor(private props: MonitorRepositoriesHandlerProps) {}
  public handler = async () => {
    const organizationInfo = await new OrganizationManager().get(this.props.organizationName);
    const githubClient = new GithubClient(organizationInfo.githubToken);
    const cloudFormationManager = new CloudFormationManager();
    const repositoryExplorer = new RepositoryExplorer(githubClient, cloudFormationManager);
    const jobScheduler = new JobScheduler(this.props.queueUrl, new AWS.SQS());
    const coordinator = new PipelineCoordinator(repositoryExplorer, cloudFormationManager, jobScheduler);
    await coordinator.scheduleDiscoveryJobs(this.props.organizationName);
  };
}

const queueUrl = process.env.SQS_QUEUE_URL || '';
const organizationName = process.env.ORGANIZATION_NAME || 'stage-tech';
export const handler = new MonitorRepositoriesHandler({ queueUrl, organizationName }).handler;
