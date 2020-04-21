import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import {BuildOperationsDetails} from "./buildOperationsDetails"

export class BuildIamRole extends cdk.Construct {
  public readonly role : iam.IRole  ;
  constructor(scope: cdk.Construct, id: string, props: BuildOperationsDetails) {
    super(scope, id);
   
     const codebuildRole = new iam.Role(this, "Role_Codebuild", {
      roleName: `PLF-${props.projectName}-CodebuildRunner`,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    codebuildRole.attachInlinePolicy(new iam.Policy(this, "CodeBuildCloudFormationAccess" , {
      policyName :`PLF-${props.projectName}-CloudFormationAccess`,
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
        actions: ['codebuild:CreateProject']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['sts:*']
      })
    ]
    }));
 
    this.role = codebuildRole;
  }
}
