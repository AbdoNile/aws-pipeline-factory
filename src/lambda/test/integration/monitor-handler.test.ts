import dotenv from 'dotenv';
dotenv.config();
import { MonitorRepositoriesHandler } from '../../src/monitor/handler-monitor-repositories';
import { PipelineManagementHandler } from '../../src/monitor/handler-pipeline-management';
import AuthHelper from '../auth-helper';
const OLD_ENV = process.env;
const queueUrl = 'https://sqs.eu-west-1.amazonaws.com/928065939415/repository_discovery_jobs';

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

xdescribe('lambda Harness', () => {
  it('Monitor handler lambda', async () => {
    const handler = new MonitorRepositoriesHandler({
      organizationName: 'stage-tech',
      queueUrl,
    });
    await handler.handler();
  });

  it('Manage Pipeline Handler', async () => {
    const payload = '{"name":"pipeline-factory","owner":"stage-tech","id":"302112501"}';

    const sqsMessage = {
      Records: [
        {
          messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
          receiptHandle: 'MessageReceiptHandle',
          body: payload,
          attributes: {
            ApproximateReceiveCount: '1',
            SentTimestamp: '1523232000000',
            SenderId: '123456789012',
            ApproximateFirstReceiveTimestamp: '1523232000001',
          },
          messageAttributes: {},
          md5OfBody: '{{{md5_of_body}}}',
          eventSource: 'aws:sqs',
          eventSourceARN: 'arn:aws:sqs:eu-west-1:123456789012:MyQueue',
          awsRegion: 'eu-west-1',
        },
      ],
    };
    const handler = new PipelineManagementHandler('PipeLine-Factory');
    await handler.handler(sqsMessage);
  });
});
