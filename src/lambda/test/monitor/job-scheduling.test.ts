import AWS from 'aws-sdk';

import { JobScheduler } from '../../src/monitor/JobScheduler';
import AuthHelper from '../auth-helper';
const OLD_ENV = process.env;
beforeAll(async () => {
  jest.resetModules(); // this is important - it clears the cache
  process.env = {
    ...OLD_ENV,
    AWS_PROFILE: 'admin-stage',
    AWS_SDK_LOAD_CONFIG: '1',
  };

  const credentials = AuthHelper.LoadCredentials('stage-dev');
  console.log(credentials.accessKeyId);
});

beforeEach(() => {
  delete process.env.NODE_ENV;
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe('Sample Test', () => {
  it('Should Create messages in the queue', async () => {
    const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/928065939415/repository_discovery_jobs';
    const owner = 'stage-tech';
    const scheduler = new JobScheduler(queueUrl, new AWS.SQS());
    const result = await scheduler.queueRepositoryDiscoveryJobs([
      {
        name: 'repo1',
        owner,
      },
      {
        name: 'repo2',
        owner,
      },
    ]);
    expect(result).toHaveLength(2);
  });
});
