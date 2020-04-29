import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import {BuildOperationsDetails} from "./buildOperationsDetails"
import { Effect } from "@aws-cdk/aws-iam";

export class BuildRunnerIamRole extends cdk.Construct {
  public readonly role : iam.IRole  ;
  constructor(scope: cdk.Construct, id: string, props: BuildOperationsDetails) {
    super(scope, id);
   
     const codebuildRole = new iam.Role(this, "Role_Codebuild", {
      roleName: `PLF-${props.projectName}`,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    
    
    if ( codebuildRole.assumeRolePolicy ) {
      codebuildRole.assumeRolePolicy.addStatements(
          new iam.PolicyStatement({
        actions : ["sts:AssumeRole"],
        effect : Effect.ALLOW,
        principals : [new iam.ServicePrincipal("codepipeline.amazonaws.com")]
      }))
    }

    codebuildRole.grant(new iam.ServicePrincipal("codepipeline.amazonaws.com"))

    codebuildRole.attachInlinePolicy(new iam.Policy(this, "CodeBuildCloudFormationAccess" , {
      policyName :`PLF-${props.projectName}`,
      statements : [ 
        new iam.PolicyStatement({
        resources: ['*'],
        actions: ['*']
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
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['s3:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['s3:*']
      })
    ]
    }));
 
    this.role = codebuildRole;
  }
}

