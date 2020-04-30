import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as iam from "@aws-cdk/aws-iam";

import FactoryProperties from './factoryProperties'
export default class ApiEntryPoint extends cdk.Construct {
  public readonly buildProjectArn : string  ;
  constructor(scope: cdk.Construct, id: string, lambdaRole: iam.IRole, 
    factoryBuilderProjectName : string, props : FactoryProperties ) {
    super(scope, id);

    const triggeringLambda = new lambda.Function(
        this, "Lambda_TriggerPipelineCreation",
        {
          runtime: lambda.Runtime.NODEJS_10_X,
          handler: "branchMonitor.handleApiRequest",
          role: lambdaRole,
          code: lambda.Code.fromAsset("schedulingLambdaSrc"), 
          environment: {
            "FactoryCodeBuildProjectName" : factoryBuilderProjectName,
          },
        }
      );

    const entryPointApi = new apigateway.RestApi(this, "entryPointAPi", {
        restApiName: `${props.projectName}`,
      });
  
      const lambdaIntegration = new apigateway.LambdaIntegration(triggeringLambda, {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' }
      });
  
      entryPointApi.root.addMethod("POST", lambdaIntegration);
      const authorizationKey = new apigateway.ApiKey(this, "NewKey" , {
          apiKeyName: `${props.projectName} default key`
      })


      entryPointApi.addApiKey(authorizationKey.keyId)

  }

}