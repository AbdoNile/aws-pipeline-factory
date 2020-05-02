import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as codebuild from "@aws-cdk/aws-codebuild";


import FactoryProperties from './factoryProperties'
export default class FactoryBuilder extends cdk.Construct {
  public readonly BuildProjectArn : string;
  constructor(scope: cdk.Construct, id: string, props : FactoryProperties ) {
    super(scope, id);

    
    // this is the source code to get github specs
    const gitHubSource = codebuild.Source.gitHub({
      owner: props.githubRepositoryOwner,
      repo: props.githubRepositoryName,
      branchOrRef : props.githubRepositoryBranch,
      webhook: false,
    });

    // create a role to use with codebuild
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
      })
      
    ]
    }));

    // asumption about where the buildspec is located
    const buildSpecFile = "src/PipeLineTemplate/buildspec.json";
    
  
    const cdkCodeBuilder = new codebuild.Project(
      this,
      "CodeBuild_CreatePipeline",
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
        source: gitHubSource,
        role: codebuildRole,
        projectName : `${props.projectName}-CodeBuild`
      }
    );
   
    this.BuildProjectArn = cdkCodeBuilder.projectArn;
  }

}