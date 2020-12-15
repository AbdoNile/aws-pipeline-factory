import AWS from 'aws-sdk';
import { ResourceLimits } from 'worker_threads';

export interface PipeLineOperationResult {
  message: string;
  buildArn?: string;
}

export class StackInformation {
  constructor(stack: AWS.CloudFormation.Stack) {
    this.stackName = stack.StackName;
    this.repository = stack.Tags?.find((t) => t.Key == 'repository')?.Value || '';
    this.owner = stack.Tags?.find((t) => t.Key == 'owner')?.Value || '';
    this.branchName = stack.Tags?.find((t) => t.Key == 'branch')?.Value || '';
  }

  stackName: string;
  repository: string;
  owner: string;
  branchName: string;
}

export class CloudFormationManager {
  cloudFormationClient: AWS.CloudFormation;
  constructor() {
    this.cloudFormationClient = new AWS.CloudFormation();
  }

  async createPipeline(
    repositoryOwner: string,
    repositoryName: string,
    branchName: string,
  ): Promise<PipeLineOperationResult> {
    console.log(`creating pipeline stack from ${repositoryOwner}/${repositoryName}@${branchName}`);
    return {
      message: `creating pipeline stack from ${repositoryOwner}/${repositoryName}@${branchName}`,
    };
  }

  async deletePipeLineStack(
    repositoryOwner: string,
    repositoryName: string,
    branchName: string,
  ): Promise<PipeLineOperationResult> {
    const stack = await this.getPipelineStack(repositoryOwner, repositoryName, branchName);
    if (stack) {
      console.log(`deleting stack ${stack.stackName}`);
      //  const deletionResult = await cloudFormationClient.deleteStack({ StackName: stack.StackName }).promise();
      // console.log(JSON.stringify(deletionResult.$response.data));

      console.log(JSON.stringify('deletion commented out'));
      return {
        message: `deleted pipeline with cloudformation stack name ${stack.stackName}`,
      };
    } else {
      return {
        message: `no matching stack found for
         ${repositoryOwner}/${repositoryName} 
        and branch ${branchName}`,
      };
    }
  }

  private async getPipelineStack(
    repositoryOwner: string,
    repositoryName: string,
    branchName: string,
  ): Promise<StackInformation | null> {
    const result = await this.cloudFormationClient.describeStacks({}).promise();
    const matchingStacks = result.Stacks?.filter((s) =>
      this.isRelatedStack(s, repositoryOwner, repositoryName, branchName),
    );

    const stack = matchingStacks ? matchingStacks[0] : null;
    const stackInfo = stack ? new StackInformation(stack) : null;
    return stackInfo;
  }

  private isRelatedStack(
    stack: AWS.CloudFormation.Stack,
    repositoryOwner: string,
    repositoryName: string,
    branchName: string,
  ): unknown {
    return (
      stack.Tags?.find((t) => t.Key == 'repository' && t.Value == `${repositoryOwner}/${repositoryName}`) &&
      stack.Tags.find((t) => t.Key == 'service' && t.Value == `pipeline-factory`) &&
      stack.Tags.find((t) => t.Key == 'branch' && t.Value == `${branchName}`)
    );
  }

  public async findPipelineStacksForRepository(
    repositoryOwner: string,
    repositoryName: string,
  ): Promise<StackInformation[]> {
    const result = await this.cloudFormationClient.describeStacks({}).promise();
    const matchingStacks = result.Stacks?.filter(
      (s) =>
        s.Tags?.find((t) => t.Key == 'repository' && t.Value == `${repositoryOwner}/${repositoryName}`) &&
        s.Tags.find((t) => t.Key == 'service' && t.Value == `pipeline-factory`),
    );

    return (
      matchingStacks?.map((s) => {
        const stackInfo: StackInformation = new StackInformation(s);
        return stackInfo;
      }) || []
    );
  }
}
