import * as cdk from "@aws-cdk/core";
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as codePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";
import { IPipeline } from "@aws-cdk/aws-codepipeline";
import { IProject } from "@aws-cdk/aws-codebuild";

export interface CodePipelineProps {
  artifactsBucketName: string;
  githubRepositoryBranch: string;
  githubRepositoryOwner: string;
  githubRepositoryName: string;
  gitHubTokenSecretArn: string;
  buildAsRoleArn: string;
  projectName: string;
  buildProject: IProject;
}

export class CodePipeline extends cdk.Construct {
  public readonly pipeline: IPipeline;
  constructor(scope: cdk.Construct, id: string, props: CodePipelineProps) {
    super(scope, id);

    const buildAsRole = iam.Role.fromRoleArn(
      this,
      "BuildAsRole",
      props.buildAsRoleArn
    );

    const defaultTransientArtifactsBucketName = ssm.StringParameter.fromStringParameterName(
      this,
      "transientArtifactsBucket",
      "/pipeline-factory/transientArtifactsBucket"
    ).stringValue;

    const transientArtifactsBucket = s3.Bucket.fromBucketName(
      this,
      "TransientBucket",
      defaultTransientArtifactsBucketName
    );

    var pipeline = new codePipeline.Pipeline(this, "Pipeline", {
      pipelineName: `${props.projectName}`,
      role: buildAsRole,
      artifactBucket: transientArtifactsBucket,
      crossAccountKeys: false,
    });

    if (!props.gitHubTokenSecretArn) {
      throw new Error(`props.gitHubTokenSecretName is empty`);
    }

    console.log(props.gitHubTokenSecretArn);
    var githubToken = cdk.SecretValue.secretsManager(
      props.gitHubTokenSecretArn
    );
    const sourceCodeOutput = new codePipeline.Artifact("SourceCode");
    const fetchSourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: `GitHub-${props.projectName}`,
      repo: props.githubRepositoryName,
      owner: props.githubRepositoryOwner,
      branch: props.githubRepositoryBranch,
      output: sourceCodeOutput,
      oauthToken: githubToken,
      trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
    });

    pipeline.addStage({
      stageName: "Fetch",
      actions: [fetchSourceAction],
    });

    const buildOutput = new codePipeline.Artifact("BuildOutput");

    var buildAction = new codePipelineActions.CodeBuildAction({
      actionName: "RunBuildSpec",
      input: sourceCodeOutput,
      role: buildAsRole,
      project: props.buildProject,
      outputs: [buildOutput],
    });

    pipeline.addStage({
      stageName: "Build",
      actions: [buildAction],
    });

    if (!props.artifactsBucketName) {
      throw new Error(`props.artifactsBucket is empty`);
    }

    const artifactsBucket = s3.Bucket.fromBucketName(
      this,
      "PipeLineDeploymentArtifactsBucket",
      props.artifactsBucketName
    );

    let objectPrefix = `${props.githubRepositoryName}/${props.githubRepositoryBranch}`;

    const publishAction = new codePipelineActions.S3DeployAction({
      actionName: "S3Deploy",
      role: buildAsRole,
      bucket: artifactsBucket,
      input: buildOutput,
      objectKey: objectPrefix,
    });

    pipeline.addStage({
      stageName: "Deploy",
      actions: [publishAction],
    });

    this.pipeline = pipeline;
  }
}
