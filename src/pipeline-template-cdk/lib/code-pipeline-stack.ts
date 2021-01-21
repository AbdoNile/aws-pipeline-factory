import * as cdk from "@aws-cdk/core";
import * as ssm from "@aws-cdk/aws-ssm";
import * as secretManager from "@aws-cdk/aws-secretsmanager";
import { CodeBuildProject } from "./code-build-project";
import { CodePipeline } from "./code-pipeline";

export class CodePipelineStackProps implements cdk.StackProps {
  readonly tags?: { [key: string]: string };
  readonly env?: cdk.Environment;
  readonly githubRepositoryName: string;
  readonly githubRepositoryOwner: string;
  readonly githubRepositoryBranch: string;
  readonly projectName: string;
  readonly buildSpecFileRelativeLocation?: string;
  artifactsBucket?: string;
  buildAsRoleArn?: string;
  gitHubTokenSecretArn?: string;
}

export class CodePipelineStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: CodePipelineStackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add("service", "pipeline-factory");
    cdk.Tags.of(this).add(
      "repository",
      `${props.githubRepositoryOwner}/${props.githubRepositoryName}`
    );
    cdk.Tags.of(this).add("branch", `${props.githubRepositoryBranch}`);

    const defaultArtifactBucketName = ssm.StringParameter.fromStringParameterName(
      this,
      "artifactsBucket",
      "/pipeline-factory/artifactsBucket"
    ).stringValue;

    if (props.artifactsBucket == undefined) {
      props.artifactsBucket = defaultArtifactBucketName;
    }

    const defaultGitHubSecretName = "/pipeline-factory/default-github-token";
    const defaultGitHubTokenSecretArn = secretManager.Secret.fromSecretNameV2(
      this,
      "DefaultGitHubSecret",
      defaultGitHubSecretName
    ).secretArn;

    if (!props.gitHubTokenSecretArn) {
      props.gitHubTokenSecretArn = defaultGitHubTokenSecretArn;
    }

    const defaultBuildAsRoleArn = ssm.StringParameter.fromStringParameterName(
      this,
      "defaultBuildAsRoleArn",
      "/pipeline-factory/default-build-as-role"
    ).stringValue;
    if (!props.buildAsRoleArn) {
      props.buildAsRoleArn = defaultBuildAsRoleArn;
    }

    console.log(props);

    const builder = new CodeBuildProject(this, "CodeBuilder", {
      artifactsBucketName: props.artifactsBucket,
      gitHubTokenSecretArn: props.gitHubTokenSecretArn,
      githubRepositoryBranch: props.githubRepositoryBranch,
      githubRepositoryName: props.githubRepositoryName,
      githubRepositoryOwner: props.githubRepositoryOwner,
      projectName: props.projectName,
      buildSpecLocationOverride: props.buildSpecFileRelativeLocation,
      buildAsRoleArn: props.buildAsRoleArn,
    });

    new CodePipeline(this, "CodePipeline", {
      artifactsBucketName: props.artifactsBucket,
      gitHubTokenSecretArn: props.gitHubTokenSecretArn,
      githubRepositoryBranch: props.githubRepositoryBranch,
      githubRepositoryName: props.githubRepositoryName,
      githubRepositoryOwner: props.githubRepositoryOwner,
      projectName: props.projectName,
      buildAsRoleArn: props.buildAsRoleArn,
      buildProject: builder.buildProject,
    });
  }
}
