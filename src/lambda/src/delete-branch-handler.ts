import * as lambda from 'aws-lambda';

import { PipelineManager } from './codebuild-manager';
import { PipeLinePropertiesBuilder } from './pipeline-properties-builder';
class DeleteBranchHandler {
  public handler = async (event: lambda.APIGatewayEvent, context: any) => {
    const payload = JSON.parse(event.body || '');

    const pipelineProps = new PipeLinePropertiesBuilder().build(payload);
    console.log(JSON.stringify(pipelineProps, null, 4));
    const codeBuildManager = new PipelineManager();
    const result = await codeBuildManager.deletePipeLine(pipelineProps);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  };
}

export const handler = new DeleteBranchHandler().handler;
