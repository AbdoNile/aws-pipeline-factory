export const mockData = {
  actionExecutionData: {
    $metadata: {
      httpStatusCode: 200,
      requestId: '53c4539e-f8db-4af4-9301-5ee79a01230f',
      extendedRequestId: undefined,
      cfId: undefined,
      attempts: 1,
      totalRetryDelay: 0,
    },
    actionExecutionDetails: [
      {
        actionExecutionId: 'f9e6d5e2-0472-4044-b498-c36b29b78b2a',
        actionName: 'RunBuildSpec',
        input: '[Object]',
        lastUpdateTime: '2021-05-31T07:06:17.508Z',
        output: {
          executionResult: {
            externalExecutionId: 'testExecutionId',
          },
        },
        pipelineExecutionId: '42bb849b-c35c-4548-b0b7-767921c4e6c9',
        pipelineVersion: 1,
        stageName: 'Build',
        startTime: '2021-05-31T07:04:13.099Z',
        status: 'Failed',
      },
      {
        actionExecutionId: '9e14d5be-68d8-4a88-ac87-0ae7a114de6d',
        actionName: 'GitHub-stage-door-datasync-execution-lambda-master',
        input: '[Object]',
        lastUpdateTime: '2021-05-31T07:04:12.631Z',
        output: {
          executionResult: {
            externalExecutionId: 'testExecutionId',
          },
        },
        pipelineExecutionId: '42bb849b-c35c-4548-b0b7-767921c4e6c9',
        pipelineVersion: 1,
        stageName: 'Fetch',
        startTime: '2021-05-31T07:04:07.558Z',
        status: 'Succeeded',
      },
    ],
    nextToken: undefined,
  },
  pipelineEvent: {
    version: '0',
    id: '86577b36-74ff-149c-4de1-08920c3d9a21',
    'detail-type': 'CodePipeline Pipeline Execution State Change',
    source: 'aws.codepipeline',
    account: '928065939415',
    time: '2021-05-31T07:06:17Z',
    region: 'eu-west-1',
    resources: ['arn:aws:codepipeline:eu-west-1:928065939415:stage-door-datasync-execution-lambda-master'],
    detail: {
      pipeline: 'stage-door-datasync-execution-lambda-master',
      'execution-id': '42bb849b-c35c-4548-b0b7-767921c4e6c9',
      state: 'FAILED',
      version: 1,
    },
  },
  build: {
    logs: {
      deepLink: 'https://test-link.co.uk/',
    },
    phases: [
      {
        contexts: '[Array]',
        durationInSeconds: 383,
        endTime: '2021-05-27T09:55:34.713Z',
        phaseStatus: 'SUCCEEDED',
        phaseType: 'BUILD',
        startTime: '2021-05-27T09:49:11.183Z',
      },
      {
        contexts: '[Array]',
        durationInSeconds: 1653,
        endTime: '2021-05-27T10:23:07.719Z',
        phaseStatus: 'FAILED',
        phaseType: 'POST_BUILD',
        startTime: '2021-05-27T09:55:34.713Z',
      },
    ],
  },
  pipelineData: {
    pipelineExecution: {
      artifactRevisions: [
        {
          created: undefined,
          name: 'SourceCode',
          revisionChangeIdentifier: undefined,
          revisionId: '4821350e17367a593b9ee660151c9f3631e2ce92',
          revisionSummary: 'Merge pull request #177 from stage-tech/SPX-973',
          revisionUrl:
            'https://github.com/stage-tech/stage-door-datasync-execution-lambda/commit/4821350e17367a593b9ee660151c9f3631e2ce92',
        },
      ],
      pipelineExecutionId: '42bb849b-c35c-4548-b0b7-767921c4e6c9',
      pipelineName: 'stage-door-datasync-execution-lambda-master',
      pipelineVersion: 1,
      status: 'Failed',
      statusSummary: undefined,
    },
  },
  successPipelineData: {
    pipelineExecution: {
      artifactRevisions: [
        {
          created: undefined,
          name: 'SourceCode',
          revisionChangeIdentifier: undefined,
          revisionId: '4821350e17367a593b9ee660151c9f3631e2ce92',
          revisionSummary: 'Merge pull request #177 from stage-tech/SPX-973',
          revisionUrl:
            'https://github.com/stage-tech/stage-door-datasync-execution-lambda/commit/4821350e17367a593b9ee660151c9f3631e2ce92',
        },
      ],
      pipelineExecutionId: '42bb849b-c35c-4548-b0b7-767921c4e6c9',
      pipelineName: 'stage-door-datasync-execution-lambda-master',
      pipelineVersion: 1,
      status: 'Succeeded',
      statusSummary: undefined,
    },
  },
};
