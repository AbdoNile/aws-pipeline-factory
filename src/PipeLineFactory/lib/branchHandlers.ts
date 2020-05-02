import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import TriggeringLambdaProperties from './triggeringLambdaProperties'
import { IFunction } from "@aws-cdk/aws-lambda";

export default class BranchHandlers extends cdk.Construct {
 
  public readonly BranchCreationHandler : IFunction  ;
 
  public readonly BranchDeletionHandler : IFunction  ;

  public readonly GitHubContextHandler : IFunction  ;
 
 
  constructor(scope: cdk.Construct, id: string, props : TriggeringLambdaProperties ) {
    super(scope, id);

    const environmentVariables :{ [key : string] : string} = {
      "FactoryCodeBuildProjectName" : props.factoryBuilderProjectName,
      "BUILD_AS_ROLE_ARN" : props.buildAsRoleArn,
      "DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME" : props.transientArtifactsBucketName,
      "DEFAULT_ARTIFACTS_BUCKET_NAME" : props.defaultBuildArtifactsBucketName || '' ,
      "DEFAULT_GITHUB_TOKEN_SECRET_NAME" : props.default_github_token_secret_name
    };

    const creationLambda = new lambda.Function(
        this, "Lambda_BranchCreation",
        {
          runtime: lambda.Runtime.NODEJS_10_X,
          functionName : `${props.projectName}-BranchCreatedHandler`,
          handler: "branchMonitor.branchCreated",
          role: props.lambdaRole,
          code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
          environment: environmentVariables,
          timeout : cdk.Duration.seconds(10)
        }
      );
      this.BranchCreationHandler = creationLambda;

      const deletionLambda = new lambda.Function(
        this, "Lambda_BranchDeletion",
        {
          runtime: lambda.Runtime.NODEJS_10_X,
          functionName : `${props.projectName}-BranchDeletedHandler`,
          handler: "branchMonitor.branchDeleted",
          role: props.lambdaRole,
          code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
          environment: environmentVariables,
          timeout : cdk.Duration.seconds(10)
        }
      );

      this.BranchDeletionHandler = deletionLambda;

      const gitHubEventsHandler = new lambda.Function(
        this, "Lambda_GitHubEvents",
        {
          runtime: lambda.Runtime.NODEJS_10_X,
          functionName : `${props.projectName}-GitHubContext`,
          handler: "branchMonitor.githubEventRecieved",
          role: props.lambdaRole,
          code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
          environment: environmentVariables,
          timeout : cdk.Duration.seconds(10)
        }
      );

      this.GitHubContextHandler = gitHubEventsHandler;
  }
}