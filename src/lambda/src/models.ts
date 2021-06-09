export class SettingsOverrides {
  gitHubTokenSecretArn?: string;
  buildSpecLocation?: string;
  buildAsRoleArn?: string;
  monitoredBranches?: string[];
  notifications?: NotificationSettings[];
}

export class Repository {
  name: string;
  owner: string;
  defaultBranch: string;
  topics: string[];
  repositoryId: string;
  branches: Branch[];
  settings?: SettingsOverrides;
}

export class DiscoveryJob {
  name: string;
  owner: string;
}

export class Branch {
  constructor(public branchName: string, public commitSha: string) {}
  public pipelineStack: StackInformation;
}

export interface PipeLineOperationResult {
  message: string;
  buildArn?: string;
}

export class StackInformation {
  stackName: string;
  repository: string;
  owner: string;
  branchName: string;
  constructor(stack: AWS.CloudFormation.Stack) {
    this.stackName = stack.StackName;
    this.repository = stack.Tags?.find((t) => t.Key == 'repository')?.Value || '';
    this.owner = stack.Tags?.find((t) => t.Key == 'owner')?.Value || '';
    this.branchName = stack.Tags?.find((t) => t.Key == 'branch')?.Value || '';
  }
}

export interface PipelineExecutionEvent {
  'detail-type': string;
  detail: any;
}

export interface PipelineEventDetail {
  pipeline: string;
  executionId: string;
  state: PipelineState;
}

export interface PipelineData {
  pipelineName: string;
  pipelineState: PipelineState;
  pipelineExecutionId: string;
  commitUrl: string;
  commitMessage: string;
  commitAuthor: string;
  pipelineFailiorStage?: StageName;
  buildLogs?: string;
  buildFailiorPhase?: string;
}

export enum PipelineState {
  STARTED = 'STARTED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  UNKNOWN = 'UNKNOWN',
}

export enum StageName {
  FETCH = 'Fetch',
  BUILD = 'Build',
  DEPLOY = 'Deploy',
  UNKNOWN = 'UNKNOWN',
}

export interface NotificationSettings {
  branches: string[];
  event: PipelineState;
  channelId: string;
  channelType: string;
}
