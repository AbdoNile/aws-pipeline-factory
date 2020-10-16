import { PipelineManager } from '../../src/codebuild-manager';
import { PipeLinePropertiesBuilder } from '../../src/pipeline-properties-builder';
import AuthHelper from '../auth-helper';
const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules(); // this is important - it clears the cache
  process.env = {
    ...OLD_ENV,
    AWS_PROFILE: 'admin-stage',
    AWS_SDK_LOAD_CONFIG: '1',
  };

  const credentials = AuthHelper.LoadCredentials('stage-dev');
  console.log(credentials.accessKeyId);

  delete process.env.NODE_ENV;
});

afterEach(() => {
  process.env = OLD_ENV;
});

xdescribe('Sample Test', () => {
  it('should correctly extract properties from payload', async () => {
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
    const manager = new PipelineManager();
    const result = await manager.deletePipeLine(props);
  });
});
