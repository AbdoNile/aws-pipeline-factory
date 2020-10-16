export interface PipelineProperties {
  monitoredBranches?: string[];
  slackChannelNamePrefix: string;
  slackWorkspaceId: string;
  buildAsRoleArn: string;
  transientArtifactsBucket: string;
  artifactsPrefix: string;
  gitHubTokenSecretName: string;
  artifactsBucketName: string;
  buildSpecLocation: string;
  repository_owner: string;
  projectName: string;
  repository_name: string;
  branchName: string;
}

export class PipeLinePropertiesBuilder {
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
      Object.keys(repositorySettings).forEach(function (key) {
        mergedParameters[key] = repositorySettings[key];
      });
    }
    return mergedParameters;
  }

  public build(payLoad: any): PipelineProperties {
    const flattenedPayLoad = this.flattenRequest(payLoad, payLoad.settings);

    const branchName = this.extractBranchName(flattenedPayLoad.branch);

    const props: PipelineProperties = {
      branchName: branchName,
      projectName: process.env.FactoryCodeBuildProjectName || '',
      transientArtifactsBucket:
        flattenedPayLoad.transient_artifacts_bucket || process.env.DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME,
      gitHubTokenSecretName: flattenedPayLoad.github_token_secret_name || process.env.DEFAULT_GITHUB_TOKEN_SECRET_NAME,
      buildAsRoleArn: flattenedPayLoad.buildAsRoleArn || process.env.BUILD_AS_ROLE_ARN,
      buildSpecLocation: flattenedPayLoad.buildspecFileLocation || 'buildspec.yml',
      artifactsPrefix: flattenedPayLoad.artifacts_prefix || '',
      slackWorkspaceId: flattenedPayLoad.slackWorkspaceId || process.env.SLACK_WORKSPACE_ID,
      slackChannelNamePrefix: flattenedPayLoad.slackChannelNamePrefix || process.env.SLACK_CHANNEL_NAME_PREFIX,
      artifactsBucketName: flattenedPayLoad.artifactsBucketName || process.env.DEFAULT_ARTIFACTS_BUCKET_NAME,
      repository_owner: flattenedPayLoad.repository_owner,
      repository_name: flattenedPayLoad.repository_name,
      monitoredBranches: flattenedPayLoad.monitoredBranches,
    };

    return props;
  }
}
