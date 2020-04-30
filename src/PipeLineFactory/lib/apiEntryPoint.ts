import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";
import TriggeringLambdaProperties from './triggeringLambdaProperties'

export default class ApiEntryPoint extends cdk.Construct {
  public readonly buildProjectArn : string  ;
  constructor(scope: cdk.Construct, id: string, props : TriggeringLambdaProperties ) {
    super(scope, id);

    const triggeringLambda = new lambda.Function(
        this, "Lambda_TriggerPipelineCreation",
        {
          runtime: lambda.Runtime.NODEJS_10_X,
          functionName : `${props.projectName}-API-Handler`,
          handler: "branchMonitor.handleApiRequest",
          role: props.lambdaRole,
          code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
          environment: {
            "FactoryCodeBuildProjectName" : props.factoryBuilderProjectName,
            "BUILD_AS_ROLE_ARN" : props.buildAsRoleArn,
            "TRANSIENT_ARTIFACTS_BUCKET_NAME" : props.transientArtifactsBucketName
          }
        }
      );

    const entryPointApi = new apigateway.RestApi(this, "APIGateway");
  
      const lambdaIntegration = new apigateway.LambdaIntegration(triggeringLambda, {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' }
      });
  
      entryPointApi.root.addMethod("POST", lambdaIntegration);
      

  }

}