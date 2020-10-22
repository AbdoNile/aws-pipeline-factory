import * as lambda from 'aws-lambda';

import { PipelineManager } from './codebuild-manager';
import { PipeLinePropertiesBuilder } from './pipeline-properties-builder';
class PipelineNotificationsHandler {
  public handler = async (event: lambda.SNSEvent, context: any) => {
    const payload = JSON.parse(event.Records[0].Sns.Message || '');

    console.log(JSON.stringify(payload, null, 4));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
  };
}

export const handler = new PipelineNotificationsHandler().handler;
