import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";
import { CodeBuilder } from "./codeBuilder";
import { CodePipeline } from "./codePipeline";

export class BuildOperationsDetails implements cdk.StackProps {
  readonly githubRepositoryName: string;
  readonly githubRepositoryOwner: string;
  readonly githubRepositoryBranch: string;
  readonly gitHubTokenSecretName?: string;
  readonly projectName: string;
  readonly buildSpecFileRelativeLocation?: string;
  artifactsBucket?: string;
  readonly buildAsRoleArn: string;
  readonly tags?: { [key: string]: string };
  readonly env?: cdk.Environment;
}

export class BuildRoomStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: BuildOperationsDetails) {
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
      "/Pipeline-Factory/artifactsBucket"
    ).stringValue;

    console.log(`defaultArtifactBucketName ${defaultArtifactBucketName}`)
    console.log(`props.artifactsBucket ${props.artifactsBucket == undefined}`)
    
    if (props.artifactsBucket == undefined) {
      props.artifactsBucket = defaultArtifactBucketName;
    }

    console.log(props);
    const buildIamROle = iam.Role.fromRoleArn(
      this,
      "BuildAsRole",
      props.buildAsRoleArn
    );

    const builder = new CodeBuilder(this, "CodeBuilder", props, buildIamROle);

    new CodePipeline(
      this,
      "CodePipeLine",
      props,
      builder.buildProjectArn,
      buildIamROle
    );
  }
}
