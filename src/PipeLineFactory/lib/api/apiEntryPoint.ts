import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import { ApiKeySourceType } from "@aws-cdk/aws-apigateway";
import * as acm from "@aws-cdk/aws-certificatemanager";
import BranchHandlers from "./branchHandlers";
import { IFunction } from "@aws-cdk/aws-lambda";

export interface ApiProps {
  apiBranchCreated: IFunction;
  apiDomainCertificateArn?: string ;
  apiDomainName?: string;
  apiBranchDeleted: IFunction;

}

export default class ApiEntryPoint extends cdk.Construct {
  public readonly buildProjectArn: string;
  constructor(
    scope: cdk.Construct,
    id: string,
    props: ApiProps
  ) {
    super(scope, id);
    const projectName = cdk.Stack.of(this).stackName;
    const entryPointApi = new apigateway.RestApi(this, "APIGateway", {
      restApiName: projectName,
      apiKeySourceType: ApiKeySourceType.HEADER,
    });

    const creationLambda = new apigateway.LambdaIntegration(
      props.apiBranchCreated,
      {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
      }
    );

    const branchCreation = entryPointApi.root.addResource("branch-created");
    branchCreation.addMethod("POST", creationLambda, {
      apiKeyRequired: true,
    });

    const deletionLambda = new apigateway.LambdaIntegration(
      props.apiBranchDeleted,
      {
        requestTemplates: { "application/json": '{ "statusCode": "200" }' },
      }
    );

    const branchDeletion = entryPointApi.root.addResource("branch-deleted");
    branchDeletion.addMethod("POST", deletionLambda, {
      apiKeyRequired: true,
    });

    const apiKey = new apigateway.ApiKey(this, `ApiGatewayKey`, {
      apiKeyName: `${projectName}-access-key`,
      description: `APIKey used to access PLF API`,
      enabled: true,
    });

    const usagePlan = new apigateway.UsagePlan(this, "UsagePlan", {
      apiKey: apiKey,
      name: "Basic Unlimited",
      apiStages: [
        {
          api: entryPointApi,
          stage: entryPointApi.deploymentStage,
        },
      ],
    });

    if (props.apiDomainName && props.apiDomainCertificateArn) {
      new apigateway.DomainName(this, "ApiCustomDomain", {
        domainName: props.apiDomainName,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          "customDomainCertificate",
          props.apiDomainCertificateArn
        ),
        endpointType: apigateway.EndpointType.REGIONAL,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
        mapping: entryPointApi,
      });
    }

    new cdk.CfnOutput(this, "APIUrl", {
      value: entryPointApi.url,
      exportName: "api-url",
    });
  }
}
