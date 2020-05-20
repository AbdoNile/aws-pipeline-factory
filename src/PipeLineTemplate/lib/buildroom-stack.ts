import * as cdk from "@aws-cdk/core";
import * as codeBuilder from './codeBuilder';
import * as codePiplineer from './codePipeline';
import * as iam from '@aws-cdk/aws-iam'
import {BuildOperationsDetails} from "./buildOperationsDetails"
import { Notification } from "./notification";


export class BuildroomStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: BuildOperationsDetails) {
    super(scope, id, props);
    const buildIamROle = iam.Role.fromRoleArn(this , "BuildAsRole", props.buildAsRoleArn);
 
    const builder = new codeBuilder.CodeBuilder(this, "CodeBuilder" , props,buildIamROle )
    const pipLine = new codePiplineer.CodePipeline(this, "CodePipeLine", props, builder.buildProjectArn, buildIamROle)

    const notification = new Notification(this, 'notification', props, pipLine.pipeline);
  }

}
