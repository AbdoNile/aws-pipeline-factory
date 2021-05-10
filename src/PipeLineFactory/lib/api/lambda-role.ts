import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";

export default class ApiHandlerLambdaRole extends cdk.Construct {
  lambdaRole: iam.Role;
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    const stackName = cdk.Stack.of(this).stackName;
    const lambdaRole = new iam.Role(this, "Role_LambdaFunction", {
      roleName: `${stackName}-Api-Handler-Lambda`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "LambdaCanStartFactoryCodeBuild", {
        policyName: `${stackName}-LambdaStartCodeBuild`,
        statements: [
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["codebuild:StartBuild"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["kms:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["ssm:*"],
          }),
        ],
      })
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "LambdaCanDiscoverStacks", {
        policyName: `${stackName}-LambdaDescribeStack`,
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
        policyName: `${stackName}-LambdaDeleteStack`,
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
        policyName: `${stackName}-LambdaWebHooks`,
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

    this.lambdaRole = lambdaRole;
  }
}
