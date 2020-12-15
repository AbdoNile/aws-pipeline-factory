import { anyOfClass, anyString, anything, capture, instance, mock, verify, when } from 'ts-mockito';

import { CloudFormationManager } from '../../src/monitor/cloudformation-manager';
import { JobScheduler } from '../../src/monitor/JobScheduler';
import { Branch, Repository, RepositoryBuildConfiguration } from '../../src/monitor/models';
import { PipelineCoordinator } from '../../src/monitor/pipeline-coordinator';
import { RepositoryExplorer } from '../../src/monitor/repository-explorer';

let repositoryExplorerMock: RepositoryExplorer,
  schedulerMock: JobScheduler,
  cloudFormationManagerMock: CloudFormationManager,
  coordinator: PipelineCoordinator;

beforeAll(() => {
  repositoryExplorerMock = mock(RepositoryExplorer);
  when(repositoryExplorerMock.findSubscribedRepositories(anyOfClass(Repository))).thenResolve([
    {
      name: 'stage-R1',
      owner: 'owner1',
      defaultBranch: 'dev',
    },
    {
      name: 'stage-R3',
      owner: 'owner1',
      defaultBranch: 'master',
    },
    {
      name: 'R2',
      owner: 'owner1',
      defaultBranch: 'master',
    },
  ]);

  schedulerMock = mock(JobScheduler);

  cloudFormationManagerMock = mock(CloudFormationManager);
});

describe('pipeline coordinator', () => {
  it('should queue repositories for discovery', async () => {
    coordinator = new PipelineCoordinator(
      instance(repositoryExplorerMock),
      instance(cloudFormationManagerMock),
      instance(schedulerMock),
    );

    await coordinator.scheduleDiscoveryJobs('owner1');

    verify(schedulerMock.queueRepositoryDiscoveryJobs(anything())).once();
  });

  it('should only queue those with stage-*', async () => {
    coordinator = new PipelineCoordinator(
      instance(repositoryExplorerMock),
      instance(cloudFormationManagerMock),
      instance(schedulerMock),
    );

    await coordinator.scheduleDiscoveryJobs('owner1');

    const message = capture(schedulerMock.queueRepositoryDiscoveryJobs).first();
    expect(message.length).toBe(1);
  });

  it('should create pipelines for new branches', async () => {
    when(cloudFormationManagerMock.findPipelineStacksForRepository(anyString(), anyString())).thenResolve([
      {
        branchName: 'old',
        repository: 'R3',
        owner: 'owner1',
        stackName: 'stack1',
      },
      {
        branchName: 'very-old',
        repository: 'R3',
        owner: 'owner1',
        stackName: 'stack1',
      },
    ]);

    when(repositoryExplorerMock.getRepositoryBuildConfiguration(anything())).thenResolve(
      new RepositoryBuildConfiguration(
        new Repository('owner1', 'R3', 'master'),
        [new Branch('old', 'someId'), new Branch('new', 'someId')],
        [],
        [],
      ),
    );

    coordinator = new PipelineCoordinator(
      instance(repositoryExplorerMock),
      instance(cloudFormationManagerMock),
      instance(schedulerMock),
    );

    verify(cloudFormationManagerMock.createPipeline(anyString(), anyString(), anyString())).once();
    const creationParams = capture(cloudFormationManagerMock.createPipeline).first();
    expect(creationParams[2]).toBe('new');
  });

  it('should delete pipelines for disappearing branches', async () => {
    when(cloudFormationManagerMock.findPipelineStacksForRepository(anyString(), anyString())).thenResolve([
      {
        branchName: 'old',
        repository: 'R3',
        owner: 'owner1',
        stackName: 'stack1',
      },
      {
        branchName: 'very-old',
        repository: 'R3',
        owner: 'owner1',
        stackName: 'stack1',
      },
    ]);

    when(repositoryExplorerMock.getRepositoryBuildConfiguration(anything())).thenResolve(
      new RepositoryBuildConfiguration(
        new Repository('owner1', 'R3', 'master'),
        [new Branch('old', 'someId'), new Branch('new', 'someId')],
        [],
        [],
      ),
    );

    coordinator = new PipelineCoordinator(
      instance(repositoryExplorerMock),
      instance(cloudFormationManagerMock),
      instance(schedulerMock),
    );

    verify(cloudFormationManagerMock.deletePipeLineStack(anyString(), anyString(), anyString())).once();
    const creationParams = capture(cloudFormationManagerMock.deletePipeLineStack).first();
    expect(creationParams[2]).toBe('very-old');
  });
});
