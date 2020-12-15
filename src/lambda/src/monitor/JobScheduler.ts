import AWS from 'aws-sdk';

import { Repository } from './models';

export class JobScheduler {
  constructor(private queueUrl: string, private sqsClient: AWS.SQS) {}
  public async queueRepositoryDiscoveryJobs(repos: Repository[]): Promise<(string | undefined)[]> {
    return Promise.all(
      repos.map(async (r) => {
        const request: AWS.SQS.SendMessageRequest = {
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify(r),
        };
        const sqsMessage = await this.sqsClient.sendMessage(request).promise();
        return sqsMessage.MessageId;
      }),
    );
  }
}
