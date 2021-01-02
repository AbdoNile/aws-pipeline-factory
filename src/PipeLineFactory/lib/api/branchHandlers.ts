import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import { IFunction } from "@aws-cdk/aws-lambda";
import ApiHandlerLambdaRole from "./lambda-role";

export interface BranchHandlersProps {
  factoryBuilderProjectName: string;
  triggerCodeS3Key: string;
  triggerCodeS3Bucket: string;
}
export default class BranchHandlers extends cdk.Construct {
  public readonly apiBranchCreated: IFunction;

  public readonly apiBranchDeleted: IFunction;

  constructor(scope: cdk.Construct, id: string, props: BranchHandlersProps) {
    super(scope, id);

    const lambdaRole = new ApiHandlerLambdaRole(this, "lambdaRole");
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
      FACTORY_CODEBUILD_PROJECT_NAME: props.factoryBuilderProjectName,
    };

    this.apiBranchCreated = new lambda.Function(
      this,
      "Lambda_API_BranchCreation",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        functionName: `${
          cdk.Stack.of(this).stackName
        }-API-BranchCreatedHandler`,
        handler: "dist/api/create-branch-handler.handler",
        role: lambdaRole.lambdaRole,
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
        functionName: `${
          cdk.Stack.of(this).stackName
        }-API-BranchDeletedHandler`,
        handler: "dist/api/delete-branch-handler.handler",
        role: lambdaRole.lambdaRole,
        code: lambdaCode,
        environment: environmentVariables,
        timeout: cdk.Duration.seconds(10),
      }
    );
  }
}
