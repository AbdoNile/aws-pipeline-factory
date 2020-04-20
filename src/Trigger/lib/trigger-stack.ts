import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as iam from "@aws-cdk/aws-iam";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as lambda from "@aws-cdk/aws-lambda";

export class TriggerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubChangesTopic: sns.Topic = new sns.Topic(
      this,
      "SNS_GitHubChange",
      {
        displayName: "GitHub Branch Tracker",
        topicName: "GitHubBranchTracker",
      }
    );

    const policy = new iam.Policy(this, "Policy_CanPublishinGitHubEvents", {
      policyName: `${this.stackName}-PublishGithubChanges`,
      statements: [
        new iam.PolicyStatement({
          actions: ["sns:publish"],
          resources: [githubChangesTopic.topicArn],
          effect: iam.Effect.ALLOW,
        }),
      ],
    });

    const user = new iam.User(this, "GithubPublisherUser", {
      userName : "GitHubPublishingService",

    })

    policy.attachToUser(user);

    const gitHubSource = codebuild.Source.gitHub({
      owner: "AbdoNile",
      repo: "Pipleliner",
      webhook: false,
    });

    const codebuildRole = new iam.Role(this, "Role_CodebuildRunAs", {
      roleName: `${this.stackName}-CodebuildRunner`,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    const buildSpecFile = "src/PipeLineSpec/buildspec.json";
    const cdkCodeBuilder = new codebuild.Project(
      this,
      "CodeBuild_CreatePipeline",
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
        source: gitHubSource,
        role: codebuildRole,
      }
    );

   
    
    const lambdaRole = new iam.Role(
      this,
      "Role_LambdaTriggerPipelineCreation",
      {
        roleName: `${this.stackName}-LambdaTriggerPipelineCreation`,
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      
      }
    );

   


    lambdaRole.addManagedPolicy( iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"))

    const triggeringLambda = new lambda.Function(
      this, "Lambda_TriggerPipelineCreation",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: "branchMonitor.handleGitHubMessage",
        role: lambdaRole,
        code: lambda.Code.fromAsset("schedulingLambdaSrc"),
        environment: {
          PipeLineCreatorCodeBuildARN: cdkCodeBuilder.projectArn,
        },
      }
    );

    const lambdaSubscription = new subscriptions.LambdaSubscription(
      triggeringLambda
    );
    githubChangesTopic.addSubscription(lambdaSubscription);
  }
}
