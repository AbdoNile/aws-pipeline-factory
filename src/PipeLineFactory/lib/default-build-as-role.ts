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
            resources: ["*"],
            actions: ["cloudformation:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["iam:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["codebuild:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["codepipeline:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["ec2:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["ecs:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["ssm:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["lambda:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["secretsmanager:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["kms:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["s3:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["logs:*"],
          }),
          new iam.PolicyStatement({
            resources: ["*"],
            actions: ["ssm:GetParameter"],
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

    new ssm.StringParameter(this, "artifactsBucketSsm", {
      parameterName: `/${stack.stackName.toLowerCase()}/default-build-as-role`,
      stringValue: codebuildRole.roleArn,
    });

    this.role = codebuildRole;
  }
}
