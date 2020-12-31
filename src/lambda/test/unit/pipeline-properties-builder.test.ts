import { PipeLinePropertiesBuilder } from '../../src/api/pipeline-properties-builder';

describe('Sample Test', () => {
  beforeAll(() => {
    process.env.FACTORY_CODEBUILD_PROJECT_NAME = 'MY_FACTORY_CODEBUILD_PROJECT_NAME';
  });

  it('should correctly extract properties from payload', () => {
    const payload = {
      event: 'push',
      repository_name: 'stage-door-cdk',
      repository_owner: 'stage-tech',
      branch: 'refs/heads/abdo',
      settings: {
        monitoredBranches: ['abdo', 'bugfix-12', 'test', 'demo'],
        buildAsRoleArn: 'buildAsRoleArn',
        artifactsBucketName: 'artifactsBucketName',
      },
    };
    const props = new PipeLinePropertiesBuilder().build(payload);

    expect(props.branchName).toBe('abdo');
    expect(props.repository_name).toBe('stage-door-cdk');
    expect(props.repository_owner).toBe('stage-tech');
    expect(props.monitoredBranches?.sort()).toEqual(['abdo', 'bugfix-12', 'test', 'demo'].sort());
    expect(props.buildAsRoleArn).toEqual('buildAsRoleArn');
    expect(props.artifactsBucketName).toEqual('artifactsBucketName');
  });
});
