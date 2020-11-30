import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";

export default class DefaultBuildAsRole extends cdk.Construct {
  role: iam.Role;
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);
    const projectName = cdk.Stack.of(this).stackName
    
    const codebuildRole = new iam.Role(this, "Role_Codebuild", {
      roleName: `PLF-${projectName}-CodebuildRunner`,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    codebuildRole.attachInlinePolicy(new iam.Policy(this, "CodeBuildCloudFormationAccess" , {
      policyName :`PLF-${projectName}-CloudFormationAccess`,
      statements : [ 
        new iam.PolicyStatement({
        resources: ['*'],
        actions: ['cloudformation:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['iam:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['codebuild:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['codepipeline:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['secretsmanager:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['kms:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['s3:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['logs:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['ssm:GetParameter']
      })
    ]
    }));

    this.role = codebuildRole;
  }
}
