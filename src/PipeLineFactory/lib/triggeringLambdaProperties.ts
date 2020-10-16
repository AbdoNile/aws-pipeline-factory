import * as iam from "@aws-cdk/aws-iam";

export default class TriggeringLambdaProperties {
  public readonly projectName: string;
  public readonly factoryBuilderProjectName: string;
  public readonly buildAsRoleArn: string;
  public readonly transientArtifactsBucketName: string;
  public readonly lambdaRole: iam.IRole
  public readonly defaultBuildArtifactsBucketName: string;
  public readonly default_github_token_secret_name: string
  public readonly slackWorkspaceId: string;
  public readonly slackChannelNamePrefix: string;
  public readonly triggerCodeS3Bucket: string;
  public readonly triggerCodeS3Key: string;
}