export interface PipelineProperties {
  factoryCodeBuildProjectName: string;
  monitoredBranches?: string[];
  buildAsRoleArn?: string;
  gitHubTokenSecretArn?: string;
  artifactsBucketName?: string;
  buildSpecLocation?: string;
  repository_owner: string;
  repository_name: string;
  branchName: string;
}

export class PipeLinePropertiesBuilder {
  public build(payLoad: any): PipelineProperties {
    const flattenedPayLoad = this.flattenRequest(payLoad, payLoad.settings);

    const branchName = this.extractBranchName(flattenedPayLoad.branch);

    if (!process.env.FACTORY_CODEBUILD_PROJECT_NAME) {
      throw new Error(`process.env.FACTORY_CODEBUILD_PROJECT_NAME is not provided`);
    }

    const props: PipelineProperties = {
      branchName: branchName,
      gitHubTokenSecretArn: flattenedPayLoad.github_token_secret_arn,
      buildAsRoleArn: flattenedPayLoad.buildAsRoleArn,
      artifactsBucketName: flattenedPayLoad.artifactsBucketName,
      factoryCodeBuildProjectName: process.env.FACTORY_CODEBUILD_PROJECT_NAME,
      buildSpecLocation: flattenedPayLoad.buildspecFileLocation || 'buildspec.yml',
      repository_owner: flattenedPayLoad.repository_owner,
      repository_name: flattenedPayLoad.repository_name,
      monitoredBranches: flattenedPayLoad.monitoredBranches,
    };

    return props;
  }

  private extractBranchName(branchName: string) {
    let trimmedBranchName = branchName.toLowerCase();
    if (branchName.startsWith('refs/heads/')) {
      trimmedBranchName = branchName.replace('refs/heads/', '');
    }
    console.debug(`branch name passed from github: [${branchName}] , Trimmed Branch Name : [${trimmedBranchName}] `);
    return trimmedBranchName;
  }

  private flattenRequest(payLoad: any, repositorySettings: any): any {
    const mergedParameters = payLoad;
    mergedParameters.settings = null;
    if (repositorySettings) {
      Object.keys(repositorySettings).forEach((key) => {
        mergedParameters[key] = repositorySettings[key];
      });
    }
    return mergedParameters;
  }
}
