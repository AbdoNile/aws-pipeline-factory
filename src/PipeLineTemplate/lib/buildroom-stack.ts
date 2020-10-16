import * as cdk from "@aws-cdk/core";
import * as codeBuilder from './codeBuilder';
import * as codePiplineer from './codePipeline';
import * as iam from '@aws-cdk/aws-iam'
import {BuildOperationsDetails} from "./buildOperationsDetails"
import { Notification } from "./notification";


export class BuildRoomStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: BuildOperationsDetails) {
    super(scope, id, props);

    cdk.Tag.add(this , "service" , "pipeline-factory");
    cdk.Tag.add(this , "repository" , `${props.githubRepositoryOwner}/${props.githubRepositoryName}`);
    cdk.Tag.add(this , "branch" , `${props.githubRepositoryBranch}`);
  
    const buildIamROle = iam.Role.fromRoleArn(this , "BuildAsRole", props.buildAsRoleArn);
 
    const builder = new codeBuilder.CodeBuilder(this, "CodeBuilder" , props,buildIamROle )
    const pipLine = new codePiplineer.CodePipeline(this, "CodePipeLine", props, builder.buildProjectArn, buildIamROle)

  }

}
