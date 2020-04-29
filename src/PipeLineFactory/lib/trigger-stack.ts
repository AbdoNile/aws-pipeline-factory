import * as cdk from "@aws-cdk/core";
import * as sns from "@aws-cdk/aws-sns";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as iam from "@aws-cdk/aws-iam";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as lambda from "@aws-cdk/aws-lambda";

export class TriggerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create topic to receive github notifications
    const githubChangesTopic: sns.Topic = new sns.Topic(this,"SNS_GitHubChanges",
      {
        displayName: `${this.stackName} GitHub Branch Tracker`,
        topicName: `${this.stackName}-GitHubUpdates`,
      }
    );

    // iam policy that can publish to the topic
    const policy = new iam.Policy(this, "Policy_CanPublishinGitHubEvents", {
      policyName: `${this.stackName}-PublishGithubChanges`,
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
      userName : `${this.stackName}-GitHubPublishingService`,
    })

    // attach the sns publishing policy to the new user
    policy.attachToUser(user);
    
    // this is the source code to get github specs
    const gitHubSource = codebuild.Source.gitHub({
      owner: "stage-tech",
      repo: "pipeline-factory",
      branchOrRef : "handle_feature_branch",
      webhook: false,
    });

    // create a role to use with codebuild
    const codebuildRole = new iam.Role(this, "Role_Codebuild", {
      roleName: `PLF-${this.stackName}-CodebuildRunner`,
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    codebuildRole.attachInlinePolicy(new iam.Policy(this, "CodeBuildCloudFormationAccess" , {
      policyName :`PLF-${this.stackName}-CloudFormationAccess`,
      statements : [ 
        new iam.PolicyStatement({
        resources: ['*'],
        actions: ['cloudformation:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['iam:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['codebuild:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['codepipeline:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['secretsmanager:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['kms:*']
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['s3:*']
      })
    ]
    }));

    // asumption about where the buildspec is located
    const buildSpecFile = "src/PipeLineTemplate/buildspec.json";
    
  
    const cdkCodeBuilder = new codebuild.Project(
      this,
      "CodeBuild_CreatePipeline",
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(buildSpecFile),
        source: gitHubSource,
        role: codebuildRole,
        projectName : `${this.stackName}-CodeBuild`
      }
    );
   
    // role to run the lambda function
    const lambdaRole = new iam.Role(
      this,
      "Role_LambdaFunction",
      {
        roleName: `PLF-${this.stackName}-Lambda`,
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      }
    );

    lambdaRole.addManagedPolicy( iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"))
    lambdaRole.attachInlinePolicy(new iam.Policy(this, "LambdaCanStartFactoryCodeBuild" , {
      policyName :`${this.stackName}-LambdaStartCodeBuild`,
      statements : [ new iam.PolicyStatement({
        resources: [cdkCodeBuilder.projectArn],
        actions: ['codebuild:StartBuild']
      })]
    }));
    
    const triggeringLambda = new lambda.Function(
      this, "Lambda_TriggerPipelineCreation",
      {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: "branchMonitor.handleGitHubMessage",
        role: lambdaRole,
        code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
        environment: {
          "FactoryCodeBuildProjectName" : cdkCodeBuilder.projectName,
        },
      }
    );

    const lambdaSubscription = new subscriptions.LambdaSubscription(
      triggeringLambda
    );

    githubChangesTopic.addSubscription(lambdaSubscription);
  }
}
