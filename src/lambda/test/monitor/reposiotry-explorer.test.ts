import { GithubClient } from '../../src/monitor/github-client';
import { MonitorRepositoriesHandler } from '../../src/monitor/handler-monitor-repositories';
import { OrganizationInfo, OrganizationManager } from '../../src/monitor/organization-manager';
import { RepositoryExplorer } from '../../src/monitor/repository-explorer';
import AuthHelper from '../auth-helper';
const OLD_ENV = process.env;
let organizationInfo: OrganizationInfo;
let githubClient: GithubClient;
beforeAll(async () => {
  jest.resetModules(); // this is important - it clears the cache
  process.env = {
    ...OLD_ENV,
    AWS_PROFILE: 'admin-stage',
    AWS_SDK_LOAD_CONFIG: '1',
  };

  const credentials = AuthHelper.LoadCredentials('stage-dev');
  console.log(credentials.accessKeyId);
  organizationInfo = await new OrganizationManager().get('stage-tech');
  githubClient = await new GithubClient(organizationInfo.githubToken);
});

beforeEach(() => {
  delete process.env.NODE_ENV;
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe('Sample Test', () => {
  xit('list all repos in organization ', async () => {
    const explorer = new RepositoryExplorer(githubClient);
    const repos = await explorer.findSubscribedRepositories('stage-tech');

    console.log(JSON.stringify(repos, null, 2));
  });

  xit('should list branches in a certain repository', async () => {
    const explorer = new RepositoryExplorer(githubClient);
    const buildConfiguration = await explorer.findBranchConfigurations({
      name: 'stage-door-cdk',
      owner: 'stage-tech',
    });
    console.log(JSON.stringify(buildConfiguration, null, 2));
  });

  xit('Should Create messages in the queue', async () => {
    const explorer = new MonitorRepositoriesHandler({
      organizationName: 'stage-tech',
      queueUrl: 'https://sqs.eu-west-1.amazonaws.com/928065939415/repository_discovery_jobs',
    });
    const pipeline = await explorer.handler();
    console.log(pipeline);
  });
});
