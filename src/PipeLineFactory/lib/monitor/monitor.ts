import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as iam from "@aws-cdk/aws-iam";
import TriggeringLambdaProperties from "../triggeringLambdaProperties";
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';

export class Monitor extends cdk.Construct {
  public readonly buildProjectArn: string;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: TriggeringLambdaProperties
  ) {
    super(scope, id);
    const queue = new sqs.Queue(this, "repository_discovery_jobs", {
      queueName: `repository_discovery_jobs`,
    });

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

    const environmentVariables: { [key: string]: string } = {
      SQS_QUEUE_URL: queue.queueUrl,
      GITHUB_TOKEN_SECRET_NAME : props.default_github_token_secret_name
    };

    const lambdaRole = new iam.Role(this, "Role_LambdaFunction", {
      roleName: `PLF-${props.projectName}-Repository-Monitor`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addManagedPolicy( iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"))
    lambdaRole.attachInlinePolicy(new iam.Policy(this , "SecretManagerPolicy" , {
        statements : [ new iam.PolicyStatement({
          actions : ['secretsmanager:GetSecretValue'],
          effect : iam.Effect.ALLOW,
          resources : ['arn:aws:secretsmanager:*:secret:/pipeline-factory/organization/*']
        }) ]
    }))

    lambdaRole.attachInlinePolicy(new iam.Policy(this , "SqsPolicy" , {
      statements : [ new iam.PolicyStatement({
        actions : ['sqs:*'],
        effect : iam.Effect.ALLOW,
        resources : [queue.queueArn]
      }) ]
  }))

    new lambda.Function(this, "Lambda_Repository_Monitor", {
      runtime: lambda.Runtime.NODEJS_10_X,
      functionName: `${props.projectName}-Repository-Monitor`,
      handler: "dist/monitor/handler-monitor-repositories.handler",
      role: lambdaRole,
      code: lambdaCode,
      environment: environmentVariables,
      timeout: cdk.Duration.seconds(10),
    });

    const pipelineManagementHandler =    new lambda.Function(this, "Lambda_Pipeline_Manager", {
      runtime: lambda.Runtime.NODEJS_10_X,
      functionName: `${props.projectName}-Pipeline-Manager`,
      handler: "dist//monitor/handler-pipeline-management.handler",
      role: lambdaRole,
      code: lambdaCode,
      environment: environmentVariables,
      timeout: cdk.Duration.seconds(10),
    });

    pipelineManagementHandler.addEventSource(new SqsEventSource(queue))
  }
}
