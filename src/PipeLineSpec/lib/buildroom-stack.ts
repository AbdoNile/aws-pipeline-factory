import * as cdk from "@aws-cdk/core";
import * as codeBuilder from './codeBuilder';
import * as codePiplineer from './codePipeline';
import {BuildOperationsDetails} from "./buildOperationsDetails"


export class BuildroomStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: BuildOperationsDetails) {
    super(scope, id, props);
    
    const builder = new codeBuilder.CodeBuilder(this, "CodeBuilde" , props )
    const pipLine = new codePiplineer.CodePipeline(this, "CodePipeLine", props, builder.buildProjectArn)
  }

}
