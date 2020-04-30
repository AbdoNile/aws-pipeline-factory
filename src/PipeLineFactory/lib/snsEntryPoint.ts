import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as iam from "@aws-cdk/aws-iam";

import FactoryProperties from './factoryProperties'
export default class SnsEntryPoint extends cdk.Construct {
  public readonly buildProjectArn : string  ;
  constructor(scope: cdk.Construct, id: string, lambdaRole: iam.IRole, 
    factoryBuilderProjectName : string, props : FactoryProperties ) {
    super(scope, id);

      // create topic to receive github notifications
      const githubChangesTopic: sns.Topic = new sns.Topic(this,"SNS_GitHubChanges",
      {
        displayName: `${props.projectName} GitHub Branch Tracker`,
        topicName: `${props.projectName}-GitHubUpdates`,
      }
    );
    const triggeringLambda = new lambda.Function(
      this, "Lambda_TriggerPipelineCreation",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: "branchMonitor.handleGitHubMessage",
        role: lambdaRole,
        code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
        environment: {
          "FactoryCodeBuildProjectName" : factoryBuilderProjectName,
        },
      }
    );

    const lambdaSubscription = new subscriptions.LambdaSubscription(
      triggeringLambda
    );

    githubChangesTopic.addSubscription(lambdaSubscription);

     // iam policy that can publish to the topic
     const policy = new iam.Policy(this, "Policy_CanPublishinGitHubEvents", {
        policyName: `${props.projectName}-PublishGithubChanges`,
        statements: [
          new iam.PolicyStatement({
            actions: ["sns:publish"],
            resources: [githubChangesTopic.topicArn],
            effect: iam.Effect.ALLOW,
          }),
        ],
      });
  
       // IAM user for github actions to use
      const user = new iam.User(this, "GithubPublisherUser", {
        userName : `${props.projectName}-GitHubPublishingService`,
      })
  
      // attach the sns publishing policy to the new user
      policy.attachToUser(user);

  }

}