import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import FactoryProperties from "./factoryProperties";
import FactoryBuilder from "./factoryBuilder";
import ApiEntryPoint from "./apiEntryPoint";
import PipelineDependencies from "./pipelineDependencies";
import BranchHandlers from "./branchHandlers";
import Notifications from "./notifications/notifications";

export class TriggerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FactoryProperties) {
    super(scope, id, props);

    cdk.Tags.of(this).add("service", "pipeline-factory");
    const factoryBuilder = new FactoryBuilder(this, "factoryBuilder", props);

    // role to run the lambda function
    const lambdaRole = new iam.Role(this, "Role_LambdaFunction", {
      roleName: `PLF-${this.stackName}-Lambda`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );
    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "LambdaCanStartFactoryCodeBuild", {
        policyName: `${this.stackName}-LambdaStartCodeBuild`,
        statements: [
          new iam.PolicyStatement({
            resources: [factoryBuilder.BuildProjectArn],
            actions: ["codebuild:StartBuild"],
          }),
        ],
      })
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "LambdaCanDiscoverStacks", {
        policyName: `${this.stackName}-LambdaDescribeStack`,
        statements: [
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["cloudformation:DescribeStacks"],
          }),
        ],
      })
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "LambdaCanDeleteStacks", {
        policyName: `${this.stackName}-LambdaDeleteStack`,
        statements: [
          new iam.PolicyStatement({
            resources: ["*"],
            actions: [
              "cloudformation:DeleteStack",
              "codebuild:DeleteProject",
              "codepipeline:DeletePipeline",
              "codepipeline:GetPipeline",
              "secretsmanager:GetSecretValue",
            ],
            conditions: {
              StringEquals: { "aws:ResourceTag/service": "pipeline-factory" },
            },
          }),
        ],
      })
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "LambdaCanWebHooks", {
        policyName: `${this.stackName}-LambdaWebHooks`,
        statements: [
          new iam.PolicyStatement({
            resources: ["*"],
            actions: [
              "codepipeline:DeletePipeline",
              "codepipeline:GetPipeline",
              "codepipeline:DeregisterWebhookWithThirdParty",
              "codepipeline:DeleteWebhook",
            ],
          }),
        ],
      })
    );

    const pipelineDependencies = new PipelineDependencies(
      this,
      "ApplicationDependencies",
      props
    );

    const handlers = new BranchHandlers(this, "handlers", {
      buildAsRoleArn: pipelineDependencies.role.roleArn,
      factoryBuilderProjectName: factoryBuilder.BuildProjectArn,
      projectName: props.projectName,
      transientArtifactsBucketName:
        pipelineDependencies.ArtifactsBucket.bucketName,
      lambdaRole: lambdaRole,
      default_github_token_secret_name: props.default_github_token_secret_name,
      defaultBuildArtifactsBucketName: props.defaultArtifactsBucket,
      slackWorkspaceId: props.slackWorkspaceId,
      slackChannelNamePrefix: props.slackChannelNamePrefix,
      triggerCodeS3Bucket: props.triggerCodeS3Bucket,
      triggerCodeS3Key: props.triggerCodeS3Key,
    });

    const apiEntryPoint = new ApiEntryPoint(
      this,
      "apiEntryPoint",
      props,
      handlers
    );

    const notifications = new Notifications(
      this,
      "PipelineNotifications",
       {
         projectName : props.projectName,
         slackChannelNamePrefix : props.slackChannelNamePrefix,
         slackWorkspaceId : props.slackWorkspaceId,
         triggerCodeS3Bucket : props.triggerCodeS3Bucket,
         triggerCodeS3Key : props.triggerCodeS3Key
       }
    );
  }
}
