import * as cdk from "@aws-cdk/core";

export class BuildOperationsDetails implements cdk.StackProps {
  readonly githubRepositoryName: string;
  readonly githubRepositoryOwner: string;
  readonly githubRepositoryBranch: string;
  readonly gitHubTokenSecretName: string;
  readonly projectName: string;
  readonly buildSpecFileRelativeLocation?: string;
  artifactsBucket?: string;
  readonly buildAsRoleArn: string;
  readonly tags?: { [key: string]: string };
  readonly env?: cdk.Environment;
}
