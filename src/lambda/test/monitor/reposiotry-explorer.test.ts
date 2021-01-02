import { GithubClient } from '../../src/monitor/github-client';
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
    const repos = await explorer.listRepositories('stage-tech');

    console.log(JSON.stringify(repos, null, 2));
  });

  it('find Details about repository', async () => {
    const explorer = new RepositoryExplorer(githubClient);
    const repo = await explorer.getRepository('stage-tech', 'pipeline-factory');

    expect(repo.repositoryId).toEqual('257418515');
    expect(repo.defaultBranch).toEqual('master');
    expect(repo.name).toEqual('pipeline-factory');
    expect(repo.owner).toEqual('stage-tech');
    expect(repo.topics).toContain('pipeline-factory');
  });
});
