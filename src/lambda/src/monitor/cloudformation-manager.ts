import AWS from 'aws-sdk';

import { RepositoryBuildConfiguration } from './models';

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
  constructor(public factoryCodeBuildProjectName: string) {
    this.cloudFormationClient = new AWS.CloudFormation();
  }

  async createPipeline(configs: RepositoryBuildConfiguration, branchName: string): Promise<PipeLineOperationResult> {
    console.log(`creating pipeline stack from ${configs.repository.owner}/${configs.repository}@${branchName}`);
    const repo = configs.repository;
    const environmentOverRides = [
      {
        name: 'GITHUB_REPOSITORY_NAME',
        value: repo.name,
        type: 'PLAINTEXT',
      },
      {
        name: 'GITHUB_REPOSITORY_BRANCH',
        value: branchName,
        type: 'PLAINTEXT',
      },
      {
        name: 'GITHUB_REPOSITORY_OWNER',
        value: repo.owner,
        type: 'PLAINTEXT',
      },
    ];

    if (repo.settings?.gitHubTokenSecretArn) {
      environmentOverRides.push({
        name: 'GITHUB_TOKEN_SECRET_ARN',
        value: repo.settings.gitHubTokenSecretArn,
        type: 'PLAINTEXT',
      });
    }

    if (repo.settings?.buildSpecLocation) {
      environmentOverRides.push({
        name: 'BUILD_SPEC_RELATIVE_LOCATION',
        value: repo.settings.buildSpecLocation,
        type: 'PLAINTEXT',
      });
    }

    if (repo.settings?.buildAsRoleArn) {
      environmentOverRides.push({
        name: 'BUILD_AS_ROLE_ARN',
        value: repo.settings.buildAsRoleArn,
        type: 'PLAINTEXT',
      });
    }

    const params: AWS.CodeBuild.StartBuildInput = {
      projectName: this.factoryCodeBuildProjectName,
      environmentVariablesOverride: environmentOverRides,
    };

    console.log(JSON.stringify(params));

    const codebuild = new AWS.CodeBuild({ apiVersion: '2016-10-06' });
    const buildResult = await codebuild.startBuild(params).promise();

    if (buildResult.$response.error) {
      return {
        message: buildResult.$response.error.message,
      };
    }

    return {
      message: `creating pipeline stack from ${configs.repository.owner}/${configs.repository}@${branchName}`,
      buildArn: buildResult.build?.arn,
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

  public async getBranchesWithStacks(repositoryOwner: string, repositoryName: string): Promise<string[]> {
    return this.findPipelineStacksForRepository(repositoryOwner, repositoryName).then((result) => {
      return result.map((s) => s.branchName);
    });
  }

  private async findPipelineStacksForRepository(
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
