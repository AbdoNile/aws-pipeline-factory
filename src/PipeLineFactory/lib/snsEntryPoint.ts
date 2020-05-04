import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as iam from "@aws-cdk/aws-iam";
import BranchHandlers from "./branchHandlers";
import FactoryProperties from "./factoryProperties";

export default class SnsEntryPoint extends cdk.Construct {
  public readonly buildProjectArn: string;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: FactoryProperties,
    handler: BranchHandlers
  ) {
    super(scope, id);

    //#region branch deleted
    const branchDeletedTopic: sns.Topic = new sns.Topic(
      this,
      "SNS_BranchDeleted",
      {
        displayName: `${props.projectName} GitHub Branch Tracker`,
        topicName: `${props.projectName}-branch-deleted`,
      }
    );

    const bracnhDeletionSubscription = new subscriptions.LambdaSubscription(
      handler.BranchDeletionHandler
    );
    branchDeletedTopic.addSubscription(bracnhDeletionSubscription);
    //#endregion

    //#region branch created
    const branchCreatedTopic: sns.Topic = new sns.Topic(
      this,
      "SNS_BranchCreated",
      {
        displayName: `${props.projectName} GitHub Branch Tracker`,
        topicName: `${props.projectName}-branch-created`,
      }
    );

    const bracnCreationSubscription = new subscriptions.LambdaSubscription(
      handler.BranchCreationHandler
    );
    branchCreatedTopic.addSubscription(bracnCreationSubscription);
    //#endregion

    //#region legacy github events

    const githubChangesTopic: sns.Topic = new sns.Topic(
      this,
      "SNS_GitHubChanges",
      {
        displayName: `${props.projectName} GitHub Branch Tracker`,
        topicName: `${props.projectName}-GitHubUpdates`,
      }
    );

    const githubSubscription = new subscriptions.LambdaSubscription(
      handler.GitHubContextHandler
    );

    githubChangesTopic.addSubscription(githubSubscription);
    //#endregion

    // iam policy that can publish to the topic
    const policy = new iam.Policy(this, "Policy_CanPublishinGitHubEvents", {
      policyName: `${props.projectName}-PublishGithubChanges`,
      statements: [
        new iam.PolicyStatement({
          actions: ["sns:publish"],
          resources: [githubChangesTopic.topicArn, branchCreatedTopic.topicArn, branchDeletedTopic.topicArn],
          effect: iam.Effect.ALLOW,
        }),
      ],
    });

    const user = new iam.User(this, "GithubPublisherUser", {
      userName: `${props.projectName}-GitHubPublishingService`,
    });

    // attach the sns publishing policy to the new user
    policy.attachToUser(user);
  }
}
