import * as lambda from 'aws-lambda';

import { AWSClient } from '../clients/aws-client';
import { GithubClient } from '../clients/github-client';
import { PipelineData, PipelineExecutionEvent } from '../models';
import { OrganizationManager } from '../monitor/organization-manager';
import { FactorySettingsManager } from './factory-settings-manager';
import { NotificationsManager } from './notifications-manager';
import { SlackManager } from './slack-manager';

class PipelineNotificationsHandler {
  public handler = async (event: lambda.SNSEvent) => {
    const payload = JSON.parse(event.Records[0].Sns.Message || '') as PipelineExecutionEvent;
    const token = await new OrganizationManager().get('stage-tech');
    const githubClient = new GithubClient(token.githubToken);
    const awsClient = new AWSClient();
    const notificationsManager = new NotificationsManager(awsClient, githubClient);
    const factorySettingsManager = new FactorySettingsManager(awsClient, githubClient);

    const applicableSettings = await factorySettingsManager.getApplicableSettings(
      payload.detail.state,
      payload.detail.pipeline,
      payload.detail['execution-id'],
    );

    const notification: PipelineData | undefined = await notificationsManager.createEventNotification(payload);
    if (notification) {
      applicableSettings.forEach(async () => {
        await SlackManager.publishMessageToSlack(notification, 'test-channel');
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('artifactRevision'),
    };
  };
}

export const handler = new PipelineNotificationsHandler().handler;
