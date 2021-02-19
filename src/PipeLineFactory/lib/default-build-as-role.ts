import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";
import * as cdkConstants from "cdk-constants";

export default class DefaultBuildAsRole extends cdk.Construct {
  role: iam.Role;
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    const projectName = cdk.Stack.of(this).stackName;
    const stack = cdk.Stack.of(this);

    const codebuildRole = new iam.Role(this, "Role_Codebuild", {
      roleName: `PLF-${projectName}-Default-Build-As-Role`,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    codebuildRole.attachInlinePolicy(
      new iam.Policy(this, "CodeBuildCloudFormationAccess", {
        policyName: `PLF-${projectName}-CloudFormationAccess`,
        statements: [
          new iam.PolicyStatement({
            sid: "deployment",
            resources: ["*"],
            actions: ["codebuild:*", "codepipeline:*", "cloudformation:*"],
          }),
          new iam.PolicyStatement({
            sid: "compute",
            resources: ["*"],
            actions: ["ec2:*", "ecs:*", "lambda:*", "states:*", "logs:*"],
          }),
          new iam.PolicyStatement({
            sid: "parameters",
            resources: ["*"],
            actions: ["ssm:*", "secretsmanager:*"],
          }),
          new iam.PolicyStatement({
            sid: "AuthEncrypt",
            resources: ["*"],
            effect : iam.Effect.ALLOW,
            actions: ["iam:*", "kms:*", "acm:*"],
          }),
          new iam.PolicyStatement({
            sid: "delivery",
            resources: ["*"],
            actions: ["route53:*", "cloudfront:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["es:*"],
          }),
          new iam.PolicyStatement({
            sid: "messaging",
            resources: ["*"],
            actions: ["sqs:*", "events:*", "sns:*", "schemas:*"],
          }),
          new iam.PolicyStatement({
            sid: "storage",
            resources: ["*"],
            actions: ["datasync:*", "transfer:*" , "s3:*" , "ecr:*", "elasticfilesystem:*"],
          }),
          new iam.PolicyStatement({
            sid: "cognito",
            resources: ["*"],
            actions: ["cognito-idp:*", "cognito-identity:*"],
          }),
          new iam.PolicyStatement({
            sid: "monitoring",
            resources: ["*"],
            actions: ["cloudwatch:*", "config:*"],
          }),
          new iam.PolicyStatement({
            sid: "InvokeApiPolicy",
            effect: iam.Effect.ALLOW,
            actions: ["execute-api:Invoke", "execute-api:ManageConnections" ,"apigateway:*"],
            resources: ["*"],
          }),
        ],
      })
    );

    codebuildRole.assumeRolePolicy?.addStatements(
      new iam.PolicyStatement({
        principals: [
          new iam.ServicePrincipal(
            cdkConstants.ServicePrincipals.CODE_PIPELINE
          ),
        ],
        actions: ["sts:AssumeRole"],
        effect: iam.Effect.ALLOW,
      })
    );

    new ssm.StringParameter(this, "defaultRoleSsm", {
      parameterName: `/${stack.stackName.toLowerCase()}/default-build-as-role`,
      stringValue: codebuildRole.roleArn,
    });

    this.role = codebuildRole;
  }
}
