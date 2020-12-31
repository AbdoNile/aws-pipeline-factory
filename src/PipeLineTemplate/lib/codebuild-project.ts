import * as cdk from "@aws-cdk/core";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";

export interface CodeBuildProjectProps {
  buildAsRoleArn: string;
  gitHubTokenSecretArn: string;
  githubRepositoryName: string;
  githubRepositoryOwner: string;
  githubRepositoryBranch: string;
  projectName: string;
  artifactsBucketName: string;
  buildSpecLocationOverride?: string;
}
export class CodeBuildProject extends cdk.Construct {
  buildProject: codebuild.Project;
  constructor(scope: cdk.Construct, id: string, props: CodeBuildProjectProps) {
    super(scope, id);
    var buildSpecFile = props.buildSpecLocationOverride ?? "buildspec.yml";

    const gitHubSource = codebuild.Source.gitHub({
      owner: props.githubRepositoryOwner,
      repo: props.githubRepositoryName,
      webhook: false,
    });

    if (!props.artifactsBucketName) {
      throw new Error(`props.artifactsBucketName is empty`);
    }

    const artifactsBucket = s3.Bucket.fromBucketAttributes(
      this,
      "PipeLineDeploymentArtifactsBucket",
      {
        bucketName: props.artifactsBucketName,
      }
    );

    const buildAsRole = iam.Role.fromRoleArn(
      this,
      "BuildAsRole",
      props.buildAsRoleArn
    );

    const codeBuildProject = new codebuild.Project(this, "codebuildProject", {
      buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
      role: buildAsRole,
      source: gitHubSource,
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
        privileged: true,
      },

      projectName: `PLF-${props.projectName}`,
      environmentVariables: {
        ENV_NAME: {
          value: props.githubRepositoryBranch.toLowerCase(),
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        STAGE_ENV_NAME: {
          value: props.githubRepositoryBranch.toLowerCase(),
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        STAGE_PACKAGE_BUCKET_NAME: {
          value: artifactsBucket.bucketName,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        GITHUB_TOKEN_SECRET_ARN: {
          value: props.gitHubTokenSecretArn,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        GITHUB_TOKEN_SECRETNAME : {
          value: props.gitHubTokenSecretArn,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        GITHUB_REPOSITORY_BRANCH: {
          value: props.githubRepositoryBranch,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        ACCOUNT: {
          value: cdk.Stack.of(this).account,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
        AWS_REGION: {
          value: cdk.Stack.of(this).region,
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      artifacts: codebuild.Artifacts.s3({
        bucket: artifactsBucket,
        includeBuildId: true,
        name: `${props.githubRepositoryName}`,
        packageZip: true,
      }),
    });

    this.buildProject = codeBuildProject;
  }
}
