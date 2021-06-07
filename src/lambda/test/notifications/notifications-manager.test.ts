import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AWSClient } from '../../src/clients/aws-client';
import { GithubClient } from '../../src/clients/github-client';
import { PipelineState, StageName } from '../../src/models';
import { NotificationsManager } from '../../src/notifications/notifications-manager';
import { mockData } from './mockData';

describe('NotificationsManager tests', () => {
  const awsClientMock = mock(AWSClient);
  const gitHubClientMock = mock(GithubClient);

  it('getEventDetail should return correct data', async () => {
    const notificationsManager = new NotificationsManager(gitHubClientMock, awsClientMock);
    const eventDetails = notificationsManager.getEventDetails(mockData.pipelineEvent);
    expect(eventDetails.pipeline).toEqual('stage-door-datasync-execution-lambda-master');
    expect(eventDetails.executionId).toEqual('42bb849b-c35c-4548-b0b7-767921c4e6c9');
    expect(eventDetails.state).toEqual('FAILED');
  });

  it('getEventDetail should throw error', async () => {
    const notificationsManager = new NotificationsManager(gitHubClientMock, awsClientMock);
    expect(notificationsManager.getEventDetails).toThrow(Error);
  });

  it('getFailedStageActionExecution should return correct ActionExecution', async () => {
    when(awsClientMock.getActionExecutions(anything(), anything())).thenResolve(mockData.actionExecutionData);
    const notificationsManager = new NotificationsManager(gitHubClientMock, instance(awsClientMock));
    const failedActionExecutuion = await notificationsManager.getFailedStageActionExecution('test', 'test');
    expect(failedActionExecutuion.status).toBe('Failed');
    expect(failedActionExecutuion.stageName).toBe('Build');
    verify(awsClientMock.getActionExecutions('test', 'test')).once();
  });

  it('getAuthor returns correct author name', async () => {
    const gitHubMock = mock(GithubClient);
    when(gitHubMock.getCommitAuthor(anything(), anything(), anything())).thenResolve('testAuthor');
    const notificationsManager = new NotificationsManager(instance(gitHubMock), awsClientMock);
    await notificationsManager.getAuthor(mockData.pipelineData.pipelineExecution.artifactRevisions);
    verify(
      gitHubMock.getCommitAuthor(
        'stage-tech',
        'stage-door-datasync-execution-lambda',
        '4821350e17367a593b9ee660151c9f3631e2ce92',
      ),
    ).once();
  });

  it('getBuildInfo return correct build', async () => {
    when(awsClientMock.getBuild(anything())).thenResolve(mockData.build);
    const notificationsManager = new NotificationsManager(gitHubClientMock, instance(awsClientMock));
    const buildInfo = await notificationsManager.getBuildInfo(mockData.actionExecutionData.actionExecutionDetails[0]);
    verify(awsClientMock.getBuild('testExecutionId')).once();
    expect(buildInfo.buildLogs).toBe('https://test-link.co.uk/');
    expect(buildInfo.failedPhase).toBe('POST_BUILD');
  });

  it('getPipelineFailiorData return corect data from failed build', async () => {
    const localGitHubMock = mock(GithubClient);
    const awsClientMock = mock(AWSClient);
    when(awsClientMock.getActionExecutions(anything(), anything())).thenResolve(mockData.actionExecutionData);
    when(awsClientMock.getPipelineExecution(anything(), anything())).thenResolve(mockData.pipelineData);
    when(awsClientMock.getBuild(anything())).thenResolve(mockData.build);
    when(localGitHubMock.getCommitAuthor(anything(), anything(), anything())).thenResolve('testAuthor');

    const notificationsManager = new NotificationsManager(instance(localGitHubMock), instance(awsClientMock));
    const failedPipelineData = await notificationsManager.getPipelineFailiorData('test', 'test');

    verify(awsClientMock.getActionExecutions('test', 'test'));
    verify(awsClientMock.getPipelineExecution('test', 'test'));
    verify(awsClientMock.getBuild('testExecutionId')).once();
    verify(
      localGitHubMock.getCommitAuthor(
        'stage-tech',
        'stage-door-datasync-execution-lambda',
        '4821350e17367a593b9ee660151c9f3631e2ce92',
      ),
    ).once();
    expect(failedPipelineData.pipelineName).toBe('test');
    expect(failedPipelineData.pipelineState).toBe(PipelineState.FAILED);
    expect(failedPipelineData.commitUrl).toBe(
      'https://github.com/stage-tech/stage-door-datasync-execution-lambda/commit/4821350e17367a593b9ee660151c9f3631e2ce92',
    );
    expect(failedPipelineData.commitMessage).toBe('Merge pull request #177 from stage-tech/SPX-973');
    expect(failedPipelineData.commitAuthor).toBe('testAuthor');
    expect(failedPipelineData.failiorStage).toBe(StageName.BUILD);
    expect(failedPipelineData.buildLink).toBe('https://test-link.co.uk/');
    expect(failedPipelineData.buildFailiorPhase).toBe('POST_BUILD');
  });
});
