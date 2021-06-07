import { anyOfClass, anyString, instance, mock, verify } from 'ts-mockito';

import { Branch, Repository } from '../../src/models';
import { CloudFormationManager } from '../../src/monitor/cloudformation-manager';
import { PipelineCoordinator } from '../../src/monitor/pipeline-coordinator';
import { RepositoryBuildConfiguration } from '../../src/monitor/repository-build-configuration';

let cloudFormationManagerMock: CloudFormationManager, coordinator: PipelineCoordinator;

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
  topics: ['pipeline-factory'],
};

const alreadyMonitoredBranches = ['existing1', 'existinG2', 'IGnored1'];
const buildConfigs = new RepositoryBuildConfiguration(repo, alreadyMonitoredBranches);

beforeAll(() => {
  cloudFormationManagerMock = mock(CloudFormationManager);

  coordinator = new PipelineCoordinator(instance(cloudFormationManagerMock), 'pipeline-factory');
});

describe('pipeline coordinator', () => {
  it('should create pipelines for new branches', async () => {
    await coordinator.createNewPipelines(buildConfigs).then(() => {
      verify(cloudFormationManagerMock.createPipeline(anyOfClass(RepositoryBuildConfiguration), anyString())).thrice();
    });
  });

  it('should delete pipelines for disappearing branches', async () => {
    await coordinator.cleanObsoletePipelines(buildConfigs).then(() => {
      verify(cloudFormationManagerMock.deletePipeLineStack(anyString(), anyString(), anyString())).once();
    });
  });
});
