import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import TriggeringLambdaProperties from "./triggeringLambdaProperties";
import { IFunction } from "@aws-cdk/aws-lambda";

export default class BranchHandlers extends cdk.Construct {
  public readonly apiBranchCreated: IFunction;

  public readonly apiBranchDeleted: IFunction;

  constructor(
    scope: cdk.Construct,
    id: string,
    props: TriggeringLambdaProperties
  ) {
    super(scope, id);

   const sourceCodeBucket = s3.Bucket.fromBucketAttributes(
      this,
      `PackageBucket`,
      {
        bucketName: props.triggerCodeS3Bucket,
      }
    );

    const lambdaCode = lambda.Code.fromBucket(
      sourceCodeBucket,
      props.triggerCodeS3Key
    );

    const environmentVariables: { [key: string]: string } = {
      FactoryCodeBuildProjectName: props.factoryBuilderProjectName,
      BUILD_AS_ROLE_ARN: props.buildAsRoleArn,
      DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME:
        props.transientArtifactsBucketName,
      DEFAULT_ARTIFACTS_BUCKET_NAME:
        props.defaultBuildArtifactsBucketName || "",
      DEFAULT_GITHUB_TOKEN_SECRET_NAME: props.default_github_token_secret_name,
      SLACK_WORKSPACE_ID: props.slackWorkspaceId,
      SLACK_CHANNEL_NAME_PREFIX: props.slackChannelNamePrefix,
    };

    this.apiBranchCreated = new lambda.Function(
      this,
      "Lambda_API_BranchCreation",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        functionName: `${props.projectName}-API-BranchCreatedHandler`,
        handler: "dist/create-branch-handler.handler",
        role: props.lambdaRole,
        code: lambdaCode,
        environment: environmentVariables,
        timeout: cdk.Duration.seconds(10),
      }
    );

    this.apiBranchDeleted = new lambda.Function(
      this,
      "Lambda_API_BranchDeletion",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        functionName: `${props.projectName}-API-BranchDeletedHandler`,
        handler: "dist/delete-branch-handler.handler",
        role: props.lambdaRole,
        code: lambdaCode,
        environment: environmentVariables,
        timeout: cdk.Duration.seconds(10),
      }
    );
  }
}
