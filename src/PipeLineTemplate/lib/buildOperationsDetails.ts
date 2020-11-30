import * as cdk from "@aws-cdk/core";

export class BuildOperationsDetails {
  readonly githubRepositoryName: string;

  readonly githubRepositoryOwner: string;

  readonly githubRepositoryBranch: string;

  readonly projectName: string;

  readonly buildSpecFileRelativeLocation?: string;

  readonly artifactsBucket: string;

  readonly gitHubTokenSecretName: string;

  readonly artifactsPrefix: string;

  readonly transientArtifactsBucketName: string;

  readonly buildAsRoleArn: string;
}
