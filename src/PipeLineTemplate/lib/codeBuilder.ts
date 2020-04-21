import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import {BuildOperationsDetails} from "./buildOperationsDetails"

export class CodeBuilder extends cdk.Construct {
  public readonly buildProjectArn : string  ;
  constructor(scope: cdk.Construct, id: string, props: BuildOperationsDetails) {
    super(scope, id);
    var buildSpecFile = props.buildSpecFileRelativeLocation || "buildspec.yml"

    const gitHubSource = codebuild.Source.gitHub( {
      owner: props.githubRepositoryOwner,
      repo: props.githubRepositoryName,
      webhook: true,
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs(
          props.githubRepositoryBranch
        ),
      ],
    });

    const artifactsBucket = s3.Bucket.fromBucketName(this, 'ArtifactsBucket', props.artifactsBucket);
    
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
        actions: ['codebuild:CreateProject']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['sts:*']
      })
    ]
    }));
   
    
    
    //const buildAsRole = iam.Role.fromRoleArn(this , 'BuildAsROle', props.buildAsRole);
    
    const codeBuildProject = new codebuild.Project(this, props.projectName, {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
      role : codebuildRole,
      source: gitHubSource,
      projectName : props.projectName,
      artifacts : codebuild.Artifacts.s3({
          bucket: artifactsBucket,
          path :  `${props.projectName}\\${props.githubRepositoryBranch}`,
          name: `${props.projectName}.zip`
      })
    });
 
    this.buildProjectArn = codeBuildProject.projectArn;
  }
}
