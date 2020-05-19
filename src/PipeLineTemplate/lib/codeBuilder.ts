import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import { BuildOperationsDetails } from "./buildOperationsDetails"

export class CodeBuilder extends cdk.Construct {
  public readonly buildProjectArn: string;
  constructor(scope: cdk.Construct, id: string, props: BuildOperationsDetails, buildAsRole: iam.IRole) {
    super(scope, id);
    var buildSpecFile = props.buildSpecFileRelativeLocation || "buildspec.yml"

    const gitHubSource = codebuild.Source.gitHub({
      owner: props.githubRepositoryOwner,
      repo: props.githubRepositoryName,
      webhook: false/*,
      webhookFilters: [
        codebuild.FilterGroup.inEventOf(codebuild.EventAction.PUSH).andBranchIs(
          props.githubRepositoryBranch
        ),
      ]*/
    });

    const artifactsBucket = s3.Bucket.fromBucketName(this, 'CodeBuildArtifactsBucket', props.artifactsBucket);

    const codeBuildProject = new codebuild.Project(this, props.projectName, {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
      role: buildAsRole,
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0

      },
      projectName: `PLF-${props.projectName}`,
      environmentVariables: {
        "STAGE_ENV_NAME": {
          value: props.githubRepositoryBranch.toLowerCase(),
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT
        },
        "STAGE_PACKAGE_BUCKET_NAME": {
          value: props.artifactsBucket,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT
        },
        "GITHUB_TOKEN_SECRETNAME": {
          value: props.gitHubTokenSecretName,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT
        },
        "GITHUB_REPOSITORY_BRANCH": {
          value: props.githubRepositoryBranch,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT
        },
      },
      artifacts: codebuild.Artifacts.s3({
        bucket: artifactsBucket,
        path: `${props.artifactsPrefix}`,
        includeBuildId: true,
        name: `${props.githubRepositoryName}`,
        packageZip: true
      })
    });


    this.buildProjectArn = codeBuildProject.projectArn;

  }
}
