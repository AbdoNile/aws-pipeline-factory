import { CodeBuild } from '@aws-sdk/client-codebuild';
import { CodePipeline } from '@aws-sdk/client-codepipeline';

export class AWSClient {
  private codepipeline: CodePipeline;
  private codebuild: CodeBuild;
  constructor() {
    this.codepipeline = new CodePipeline({ region: 'eu-west-1' });
    this.codebuild = new CodeBuild({ region: 'eu-west-1' });
  }

  public async getPipelineExecution(pipelineName: string, executionId: string): Promise<any> {
    return this.codepipeline.getPipelineExecution({
      pipelineExecutionId: executionId,
      pipelineName: pipelineName,
    });
  }

  async getActionExecutions(pipelineName: string, executionId: string): Promise<any> {
    try {
      return this.codepipeline.listActionExecutions({
        pipelineName: pipelineName,
        filter: {
          pipelineExecutionId: executionId,
        },
      });
    } catch (e) {
      throw new Error(`Error while fetching pipeline action executions: ${e}`);
    }
  }

  async getBuild(buildId: string): Promise<any> {
    //@ts-ignore
    return (
      await this.codebuild.batchGetBuilds({
        ids: [buildId],
      })
    ).builds[0];
  }
}
