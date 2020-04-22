import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import {BuildOperationsDetails} from "./buildOperationsDetails"

export class CodeBuilder extends cdk.Construct {
  public readonly buildProjectArn : string  ;
  constructor(scope: cdk.Construct, id: string, props: BuildOperationsDetails, buildAsRole : iam.IRole ) {
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
     
    const codeBuildProject = new codebuild.Project(this, props.projectName, {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
      role : buildAsRole,
      source: gitHubSource,
      projectName : props.projectName,
      artifacts : codebuild.Artifacts.s3({
          bucket: artifactsBucket,
          path :  `${props.artifactsPrefix}`,
          name: `${props.projectName}.zip`
      })
    });
 
    this.buildProjectArn = codeBuildProject.projectArn;

  }
}
