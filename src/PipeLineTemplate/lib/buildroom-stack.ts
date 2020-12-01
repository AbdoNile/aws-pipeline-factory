import * as cdk from "@aws-cdk/core";
import * as codeBuilder from "./codeBuilder";
import * as codePipeline from "./codePipeline";
import * as iam from "@aws-cdk/aws-iam";
import * as ssm from "@aws-cdk/aws-ssm";

import { BuildOperationsDetails } from "./buildOperationsDetails";

export class BuildRoomStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: BuildOperationsDetails) {
    super(scope, id, props);

    cdk.Tag.add(this, "service", "pipeline-factory");
    cdk.Tag.add(
      this,
      "repository",
      `${props.githubRepositoryOwner}/${props.githubRepositoryName}`
    );
    cdk.Tag.add(this, "branch", `${props.githubRepositoryBranch}`);


    props.artifactsBucket =
      props.artifactsBucket ??
      ssm.StringParameter.fromStringParameterName(
        this,
        "artifactsBucket",
        "/Pipeline-Factory/artifactsBucket"
      ).stringValue;


    const buildIamROle = iam.Role.fromRoleArn(
      this,
      "BuildAsRole",
      props.buildAsRoleArn
    );

    const builder = new codeBuilder.CodeBuilder(
      this,
      "CodeBuilder",
      props,
      buildIamROle
    );
    const pipLine = new codePipeline.CodePipeline(
      this,
      "CodePipeLine",
      props,
      builder.buildProjectArn,
      buildIamROle
    );
  }
}
