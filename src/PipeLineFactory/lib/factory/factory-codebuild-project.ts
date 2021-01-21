import * as cdk from "@aws-cdk/core";
import {IRole} from "@aws-cdk/aws-iam";
import * as codebuild from "@aws-cdk/aws-codebuild";
import FactoryProps from "./factory-props";

export default class FactoryCodeBuildProject extends cdk.Construct {
  BuildProject: codebuild.Project;
  constructor(scope: cdk.Construct, id: string, props : FactoryProps , codebuildRole : IRole ) {
    super(scope, id);

    const projectName = cdk.Stack.of(this).stackName
    // this is the source code to get github specs
    const gitHubSource = codebuild.Source.gitHub({
      owner: props.pipelineTemplateGithubOwner,
      repo: props.pipelineTemplateRepositoryName,
      branchOrRef : props.pipelineTemplateBranchName,
      webhook: false,
    });

     // assumption about where the buildspec is located
    const buildSpecFile = "src/pipeline-template-cdk/buildspec.json";

    const cdkCodeBuilder = new codebuild.Project(
      this,
      "CodeBuild_CreatePipeline",
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
        source: gitHubSource,
        role: codebuildRole,
        projectName : `${projectName}`
      }
    );

    this.BuildProject = cdkCodeBuilder;
  }
}