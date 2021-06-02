import AWS from 'aws-sdk';

import { GithubClient } from '../clients/github-client';
import { JobScheduler } from './JobScheduler';
import { OrganizationManager } from './organization-manager';
import { RepositoryExplorer } from './repository-explorer';

export class MonitorRepositoriesHandlerProps {
  queueUrl: string;
  organizationName: string;
}

export class MonitorRepositoriesHandler {
  constructor(private props: MonitorRepositoriesHandlerProps) {}
  public handler = async (): Promise<void> => {
    const organizationInfo = await new OrganizationManager().get(this.props.organizationName);
    const githubClient = new GithubClient(organizationInfo.githubToken);
    const repositoryExplorer = new RepositoryExplorer(githubClient);
    const jobScheduler = new JobScheduler(this.props.queueUrl, new AWS.SQS());
    const repos = await repositoryExplorer.listRepositories(organizationInfo.name);
    await jobScheduler?.queueRepositoryDiscoveryJobs(repos);
  };
}

const queueUrl = process.env.SQS_QUEUE_URL;
if (!queueUrl) {
  throw new Error(`process.env.SQS_QUEUE_URL is not provided`);
}

const organizationName = process.env.ORGANIZATION_NAME;
if (!organizationName) {
  throw new Error(`process.env.ORGANIZATION_NAME is not provided`);
}

export const handler = new MonitorRepositoriesHandler({
  queueUrl,
  organizationName,
}).handler;
