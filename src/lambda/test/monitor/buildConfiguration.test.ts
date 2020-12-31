import { Branch, Repository, RepositoryBuildConfiguration } from '../../src/monitor/models';

describe('Build Configurations', () => {
  const repo: Repository = {
    branches: [
      new Branch('dev', 'commit1'),
      new Branch('new1', 'commit2'),
      new Branch('new2', 'commit2'),
      new Branch('existing1', 'commit3'),
      new Branch('existinG2', 'commit2'),
      new Branch('ignored1', 'commit3'),
    ],
    defaultBranch: 'dev',
    name: 'myRepo',
    owner: 'myOrg',
    repositoryId: 'myId',
    settings: { monitoredBranches: ['new1', 'new2', 'existinG2', 'exisTing1'] },
    topics: ['topic1'],
  };

  const alreadyMonitoredBranches = ['existing1', 'existinG2', 'IGnored1'];
  const repositoryBuildConfiguration = new RepositoryBuildConfiguration(repo, alreadyMonitoredBranches);

  it('should detect all requested branches ', () => {
    const requestedBranches = repositoryBuildConfiguration.requestedBranches().map((m) => m.branchName.toLowerCase());
    expect(requestedBranches.sort()).toEqual(['new1', 'new2', 'dev', 'existing1', 'existing2'].sort());
  });

  it('should detect new branches ', () => {
    const newBranches = repositoryBuildConfiguration.branchesToAdd().map((m) => m.branchName);
    expect(newBranches.sort()).toEqual(['new1', 'new2', 'dev'].sort());
  });

  it('should always include default branch ', () => {
    const newBranches = repositoryBuildConfiguration.requestedBranches().map((m) => m.branchName);
    expect(newBranches.sort()).toContain(repo.defaultBranch);
  });

  it('should decide if repository should be monitored new branches ', () => {
    expect(repositoryBuildConfiguration.shouldBeMonitored()).toBeFalsy();
  });

  it('should detect obsolete branches ', () => {
    const obsoleteBranches = repositoryBuildConfiguration.obsoletePipelines().map((m) => m.branchName);
    expect(obsoleteBranches.sort()).toEqual(['ignored1'].sort());
  });
});
