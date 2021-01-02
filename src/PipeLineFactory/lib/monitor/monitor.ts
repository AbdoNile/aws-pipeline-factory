import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import * as events from "@aws-cdk/aws-events";
import * as eventTargets from "@aws-cdk/aws-events-targets";

import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

export interface MonitorProps {
  organizationName: string;
  triggerCodeS3Key: string;
  triggerCodeS3Bucket: string;
  PipelineFactoryBuildProjectName: string;
}

export class Monitor extends cdk.Construct {
  public readonly buildProjectArn: string;
  constructor(scope: cdk.Construct, id: string, props: MonitorProps) {
    super(scope, id);
    const queue = new sqs.Queue(this, "repository_discovery_jobs", {
      queueName: `repository_discovery_jobs`,
    });

    const stackName = cdk.Stack.of(this).stackName;

    const sourceCodeBucket = s3.Bucket.fromBucketAttributes(
      this,
      `PackageBucket`,
      {
        bucketName: props.triggerCodeS3Bucket,
      }
    );

    const lambdaCode = lambda.Code.fromBucket(
      sourceCodeBucket,
      props.triggerCodeS3Key
    );

    const lambdaRole = new iam.Role(this, "Role_LambdaFunction", {
      roleName: `PLF-${stackName}-Repository-Monitor`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, "SecretManagerPolicy", {
        statements: [
          new iam.PolicyStatement({
            actions: ["secretsmanager:GetSecretValue"],
            effect: iam.Effect.ALLOW,
            resources: [
              "arn:aws:secretsmanager:*:secret:/pipeline-factory/organization/*",
            ],
          }),
          new iam.PolicyStatement({
            actions: ["cloudformation:DescribeStacks"],
            effect: iam.Effect.ALLOW,
            resources: ["*"],
          }),
          new iam.PolicyStatement({
            resources: [
              `arn:aws:codebuild:*:*:project/${props.PipelineFactoryBuildProjectName}`,
            ],
            actions: ["codebuild:StartBuild"],
          }),
          new iam.PolicyStatement({
            actions: ["sqs:*"],
            effect: iam.Effect.ALLOW,
            resources: [queue.queueArn],
          }),
        ],
      })
    );

    const repositoryMonitor = new lambda.Function(
      this,
      "Lambda_Repository_Monitor",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        functionName: `${stackName}-Repository-Monitor`,
        handler: "dist/monitor/handler-monitor-repositories.handler",
        role: lambdaRole,
        code: lambdaCode,
        environment: {
          SQS_QUEUE_URL: queue.queueUrl,
          ORGANIZATION_NAME: props.organizationName,
        },
        timeout: cdk.Duration.seconds(10),
      }
    );

    new events.Rule(this, "Schedule", {
      ruleName: `${stackName}-trigger-repository-monitoring`,
      targets: [new eventTargets.LambdaFunction(repositoryMonitor)],
      schedule: events.Schedule.rate(cdk.Duration.hours(1)),
    });

    const pipelineManagementHandler = new lambda.Function(
      this,
      "Lambda_Pipeline_Manager",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        functionName: `${stackName}-Pipeline-Manager`,
        handler: "dist/monitor/handler-pipeline-management.handler",
        role: lambdaRole,
        code: lambdaCode,
        environment: {
          FACTORY_CODEBUILD_PROJECT_NAME: props.PipelineFactoryBuildProjectName,
        },
        timeout: cdk.Duration.seconds(10),
      }
    );

    pipelineManagementHandler.addEventSource(new SqsEventSource(queue));
  }
}
