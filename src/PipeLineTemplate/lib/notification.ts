import * as cdk from "@aws-cdk/core";
import {SnsTopic} from "@aws-cdk/aws-events-targets";
import * as ssm from '@aws-cdk/aws-ssm';
import * as sns from '@aws-cdk/aws-sns'
import { BuildOperationsDetails } from "./buildOperationsDetails";
import { IPipeline } from "@aws-cdk/aws-codepipeline";

export class Notification extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, pipeline: IPipeline) {
        super(scope, id);
        
      
        let topicArn = ssm.StringParameter.valueFromLookup(scope, `pipeline-factory-events`);


        const notificationsTopic = sns.Topic.fromTopicArn(this, "NotificationsTopic", topicArn);

        pipeline.onStateChange('SlackPipelineNotifierRule',{
             target : new SnsTopic(notificationsTopic)
        }
          );
          
    }
}