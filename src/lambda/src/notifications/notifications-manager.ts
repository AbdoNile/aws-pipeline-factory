import { AWSClient } from '../clients/aws-client';
import { GithubClient } from '../clients/github-client';
import { PipelineData, PipelineEventDetail, PipelineExecutionEvent, PipelineState, StageName } from '../models';

export class NotificationsManager {
  private awsClient: AWSClient;
  private githubClient: GithubClient;
  constructor(gitHubClient: GithubClient, awsClient: AWSClient) {
    this.awsClient = awsClient;
    this.githubClient = gitHubClient;
  }
  async createEventNotification(
    event: PipelineExecutionEvent,
    configNotificationState: PipelineState,
  ): Promise<PipelineData | undefined> {
    const { pipeline, executionId, state } = this.getEventDetails(event);

    if (state !== configNotificationState) {
      console.warn('Event state does not match configured notification state. No notifications will be emmited.');
      return;
    }
    return this.getStatusData(state, pipeline, executionId);
  }

  async getStatusData(state: PipelineState, pipeline: string, executionId: string): Promise<PipelineData | undefined> {
    try {
      switch (state) {
        case PipelineState.STARTED:
          return await this.getPipelineStartOrSuccessData(pipeline, executionId);
        case PipelineState.SUCCEEDED:
          return await this.getPipelineStartOrSuccessData(pipeline, executionId);
        case PipelineState.FAILED:
          return await this.getPipelineFailiorData(pipeline, executionId);
        default:
          return undefined;
      }
    } catch (error) {
      console.error(`Error while retrieving status data: ${error}`);
      return undefined;
    }
  }

  async getPipelineStartOrSuccessData(pipeline: string, executionId: string): Promise<PipelineData> {
    const pipelineExecution = (await this.awsClient.getPipelineExecution(executionId, pipeline)).pipelineExecution;
    //@ts-ignore
    const artifactRevision = pipelineExecution?.artifactRevisions[0];
    return {
      pipelineName: pipeline,
      pipelineState: this.getPipelineState(this.required(pipelineExecution?.status)),
      commitUrl: this.required(artifactRevision?.revisionUrl),
      commitMessage: this.required(artifactRevision?.revisionSummary),
      commitAuthor: this.required(await this.getAuthor(artifactRevision)),
    };
  }

  async getPipelineFailiorData(pipeline: string, executionId: string): Promise<PipelineData> {
    const executionDetails = this.required(await this.getFailedStageActionExecution(pipeline, executionId));
    const artifactRevisions = (await this.awsClient.getPipelineExecution(executionId, pipeline)).pipelineExecution
      ?.artifactRevisions;
    const commitAuthor = await this.getAuthor(artifactRevisions);

    if (executionDetails.stageName === StageName.UNKNOWN) {
      throw Error('Retrieved unknown stage name');
    }
    if (executionDetails.stageName === StageName.BUILD) {
      const buildInfo = await this.getBuildInfo(executionDetails);
      return {
        pipelineName: pipeline,
        pipelineState: PipelineState.FAILED,
        commitUrl: this.required(artifactRevisions)[0].revisionUrl || '',
        commitMessage: this.required(artifactRevisions)[0].revisionSummary || '',
        commitAuthor: this.required(commitAuthor),
        failiorStage: executionDetails.stageName,
        buildLink: buildInfo.buildLogs,
        buildFailiorPhase: buildInfo.failedPhase,
      };
    } else {
      return {
        pipelineName: pipeline,
        pipelineState: PipelineState.FAILED,
        commitUrl: this.required(artifactRevisions)[0].revisionUrl || '',
        commitMessage: this.required(artifactRevisions)[0].revisionSummary || '',
        commitAuthor: this.required(commitAuthor),
        failiorStage: this.getStageName(this.required(executionDetails.stageName)),
      };
    }
  }

  async getBuildInfo(executionsDetails: any): Promise<any> {
    const buildId = executionsDetails.output.executionResult.externalExecutionId;
    const build = await this.awsClient.getBuild(buildId);
    return {
      // @ts-ignore
      buildLogs: build.logs.deepLink,
      failedPhase: build.phases?.find((phase) => phase.phaseStatus === 'FAILED')?.phaseType,
    };
  }

  async getAuthor(artifactRevisions: any): Promise<string | void> {
    const commitUrl = this.required(artifactRevisions)[0].revisionUrl?.split('/');
    const repo = commitUrl[commitUrl.length - 3];

    return await this.githubClient.getCommitAuthor(
      'stage-tech',
      repo,
      this.required(artifactRevisions)[0].revisionId || '',
    );
  }

  getEventDetails(event: any): PipelineEventDetail {
    const DETAIL_TYPE = 'CodePipeline Pipeline Execution State Change';
    if (event['detail-type'] == DETAIL_TYPE) {
      return {
        pipeline: event.detail.pipeline,
        executionId: event.detail['execution-id'],
        state: this.getPipelineState(event.detail.state),
      } as PipelineEventDetail;
    }
    throw new Error('Recieved event is not Pipeine Execution event and will be ignored');
  }

  async getFailedStageActionExecution(pipeline: string, executionId: string): Promise<any> {
    const actionExecutions = this.required(
      (await this.awsClient.getActionExecutions(executionId, pipeline)).actionExecutionDetails,
    );
    return actionExecutions.find((actionExecution) => actionExecution.status === 'Failed');
  }

  getPipelineState(state: string): PipelineState {
    switch (state) {
      case 'STARTED':
        return PipelineState.STARTED;
      case 'FAILED':
        return PipelineState.FAILED;
      case 'SUCCEEDED':
        return PipelineState.SUCCEEDED;
      default:
        return PipelineState.UNKNOWN;
    }
  }

  getStageName(stageName: string): StageName {
    switch (stageName) {
      case 'Fetch':
        return StageName.FETCH;
      case 'Build':
        return StageName.BUILD;
      case 'Deploy':
        return StageName.DEPLOY;
      default:
        return StageName.UNKNOWN;
    }
  }

  required<T>(input: T | undefined | null | void): T {
    if (input === null || input === undefined) {
      throw new Error('Field is required and should never be null, undefined or void');
    }
    return input;
  }
}
