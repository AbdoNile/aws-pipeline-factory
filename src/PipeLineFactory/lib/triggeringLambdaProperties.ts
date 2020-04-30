import * as iam from "@aws-cdk/aws-iam";

export default class TriggeringLambdaProperties {
  public readonly projectName: string;
  public readonly factoryBuilderProjectName: string;
  public readonly buildAsRoleArn: string;
  public readonly transientArtifactsBucketName: string;
  public readonly lambdaRole: iam.IRole
}