import * as cdk from "@aws-cdk/core";
import FactoryCodeBuildProject from "./factory-codebuild-project";
import FactoryIamRole from "./factory-iam-role";
import FactoryProps from "./factory-props";

export default class Factory extends cdk.Construct {
  buildProjectName: string;
  constructor(scope: cdk.Construct, id: string, props: FactoryProps) {
    super(scope, id);

    const factoryIamRole = new FactoryIamRole(this, "FactoryRole");

    this.buildProjectName = new FactoryCodeBuildProject(
      this,
      "FactoryCodeBuildProject",
      {
        pipelineTemplateBranchName: props.pipelineTemplateBranchName,
        pipelineTemplateGithubOwner: props.pipelineTemplateGithubOwner,
        pipelineTemplateRepositoryName: props.pipelineTemplateRepositoryName,
      },
      factoryIamRole.role
    ).BuildProject.projectName;
  }
}
