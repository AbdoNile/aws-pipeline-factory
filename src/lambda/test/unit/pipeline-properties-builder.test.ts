import { PipeLinePropertiesBuilder } from '../../src/pipeline-properties-builder';

describe('Sample Test', () => {
  it('should correctly extract properties from payload', () => {
    const payload = {
      event: 'push',
      repository_name: 'stage-door-cdk',
      repository_owner: 'stage-tech',
      branch: 'refs/heads/abdo',
      settings: {
        monitoredBranches: ['abdo', 'bugfix-12', 'test', 'demo'],
      },
    };
    const props = new PipeLinePropertiesBuilder().build(payload);

    expect(props.branchName).toBe('abdo');
    expect(props.repository_name).toBe('stage-door-cdk');
    expect(props.repository_owner).toBe('stage-tech');
    expect(props.monitoredBranches?.sort()).toEqual(['abdo', 'bugfix-12', 'test', 'demo'].sort());
  });

  it('should correctly consider environment variable defaults', () => {
    process.env.DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME = 'MY_DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME';
    process.env.DEFAULT_GITHUB_TOKEN_SECRET_NAME = 'MY_DEFAULT_GITHUB_TOKEN_SECRET_NAME';
    process.env.BUILD_AS_ROLE_ARN = 'MY_BUILD_AS_ROLE_ARN';
    process.env.SLACK_WORKSPACE_ID = 'MY_SLACK_WORKSPACE_ID';
    process.env.SLACK_CHANNEL_NAME_PREFIX = 'MY_SLACK_CHANNEL_NAME_PREFIX';
    process.env.DEFAULT_ARTIFACTS_BUCKET_NAME = 'MY_DEFAULT_ARTIFACTS_BUCKET_NAME';

    const payload = {
      event: 'push',
      repository_name: 'stage-door-cdk',
      repository_owner: 'stage-tech',
      branch: 'refs/heads/abdo',
      settings: {
        monitoredBranches: ['abdo', 'bugfix-12', 'test', 'demo'],
      },
    };
    const props = new PipeLinePropertiesBuilder().build(payload);

    expect(props.transientArtifactsBucket).toBe('MY_DEFAULT_TRANSIENT_ARTIFACTS_BUCKET_NAME');
    expect(props.gitHubTokenSecretName).toBe('MY_DEFAULT_GITHUB_TOKEN_SECRET_NAME');
    expect(props.buildAsRoleArn).toBe('MY_BUILD_AS_ROLE_ARN');
    expect(props.artifactsBucketName).toBe('MY_DEFAULT_ARTIFACTS_BUCKET_NAME');
    expect(props.slackWorkspaceId).toBe('MY_SLACK_WORKSPACE_ID');
    expect(props.slackChannelNamePrefix).toBe('MY_SLACK_CHANNEL_NAME_PREFIX');
  });
});
