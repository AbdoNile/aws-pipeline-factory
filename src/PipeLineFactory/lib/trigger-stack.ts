import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import FactoryProperties from './factoryProperties'
import FactoryBuilder from './factoryBuilder'
import SnsEntryPoint from './snsEntryPoint'
import ApiEntryPoint from './apiEntryPoint'
import  PipelineDependencies from './pipelineDependencies'

import TriggeringLambdaProperties from './triggeringLambdaProperties'

export class TriggerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: FactoryProperties) {
    super(scope, id, props);
    
    const factoryBuilder = new FactoryBuilder(this, "factoryBuilder", props )
    
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
        resources: [factoryBuilder.BuildProjectArn],
        actions: ['codebuild:StartBuild']
      })]
    }));
    
    const pipelineDependencies = new PipelineDependencies(this , "ApplicationDependencies" , props);

    const triggeringLambdaProperties : TriggeringLambdaProperties = {
      buildAsRoleArn : pipelineDependencies.role.roleArn,
      factoryBuilderProjectName : factoryBuilder.BuildProjectArn,
      projectName : props.projectName,
      transientArtifactsBucketName : pipelineDependencies.ArtifactsBucket.bucketName,
      lambdaRole : lambdaRole
    }

    const snsEntryPoint = new SnsEntryPoint(this , "snsEntryPoint", triggeringLambdaProperties )
 
    const apiEntryPoint = new ApiEntryPoint(this , "apiEntryPoint", triggeringLambdaProperties)
  }
}
