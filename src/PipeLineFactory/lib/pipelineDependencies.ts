import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as s3 from '@aws-cdk/aws-s3'
import FactoryProperties from "./factoryProperties"
import { Effect } from "@aws-cdk/aws-iam";
import { RemovalPolicy } from "@aws-cdk/core";

export default class PipelineDependencies extends cdk.Construct {
  public readonly role : iam.IRole  ;
  public readonly ArtifactsBucket: s3.Bucket;
  constructor(scope: cdk.Construct, id: string, props: FactoryProperties) {
    super(scope, id);
    const bucketName = (`${props.projectName.toLowerCase()}-${cdk.Stack.of(this).account}-${cdk.Stack.of(this).region}-artifacts`)
    this.ArtifactsBucket = new s3.Bucket(this , "transientBucket", {
      bucketName : bucketName,
      removalPolicy: RemovalPolicy.DESTROY
    })

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
      })
    ]
    }));
 
    this.role = codebuildRole;
  }
}

