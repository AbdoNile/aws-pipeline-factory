import { Branch, Repository, RepositoryBuildConfiguration } from '../../src/monitor/models';

describe('Build Configurations', () => {
  const repo = new Repository('myOrg', 'myRepo', 'dev');
  const branchesInGithub = [
    new Branch('dev', 'commit1'),
    new Branch('new1', 'commit2'),
    new Branch('new2', 'commit2'),
    new Branch('existing1', 'commit3'),
    new Branch('existinG2', 'commit2'),
    new Branch('ignored1', 'commit3'),
  ];

  const alreadyMonitoredBranches = ['existing1', 'existinG2', 'IGnored1'];
  const settings = { monitoredBranches: ['new1', 'new2', 'existinG2', 'exisTing1'] };

  it('should detect new branches ', () => {
    const repositoryBuildConfiguration = new RepositoryBuildConfiguration(
      repo,
      branchesInGithub,
      alreadyMonitoredBranches,
      settings,
    );
    const newBranches = repositoryBuildConfiguration.newMonitoredBranches().map((m) => m.branchName);
    expect(newBranches.sort()).toEqual(['new1', 'new2', 'dev'].sort());
  });

  it('should detect obsolete branches ', () => {
    const repositoryBuildConfiguration = new RepositoryBuildConfiguration(
      repo,
      branchesInGithub,
      alreadyMonitoredBranches,
      settings,
    );
    const obsoleteBranches = repositoryBuildConfiguration.obsoletePipelines().map((m) => m.branchName);
    expect(obsoleteBranches.sort()).toEqual(['ignored1'].sort());
  });
});
