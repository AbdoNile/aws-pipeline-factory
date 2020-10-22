import * as cdk from "@aws-cdk/core";
import { SnsTopic } from "@aws-cdk/aws-events-targets";
import * as ssm from "@aws-cdk/aws-ssm";
import * as sns from "@aws-cdk/aws-sns";
import { BuildOperationsDetails } from "./buildOperationsDetails";
import { IPipeline } from "@aws-cdk/aws-codepipeline";

export class Notification extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, pipeline: IPipeline, projectName : string) {
    super(scope, id);

    let topicArn = ssm.StringParameter.fromStringParameterName(
      this,
      "snsArn",
      `/pipeline-factory/events-sns-topic`
    );

    const notificationsTopic = sns.Topic.fromTopicArn(
      this,
      "NotificationsTopic",
      topicArn.stringValue
    );

    pipeline.onEvent("SlackPipelineNotifierRule", {
      target: new SnsTopic(notificationsTopic),
      ruleName: `${projectName}-pipeline-sns`,
    });
  }
}