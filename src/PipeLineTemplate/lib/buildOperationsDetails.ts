import * as cdk from "@aws-cdk/core";

export class BuildOperationsDetails implements cdk.StackProps {
  readonly githubRepositoryName: string;
  
  readonly githubRepositoryOwner: string;
  
  readonly githubRepositoryBranch: string;
  
  readonly projectName: string;
  
  readonly buildSpecFileRelativeLocation?: string;
  
  readonly artifactsBucket: string;
  
  readonly description?: string;
  
  readonly tags?: {[key: string]: string; };
  
  readonly gitHubTokenSecretName: string;

  readonly env?: cdk.Environment;
  
  readonly artifactsPrefix : string;

  readonly transientArtifactsBucketName : string;

  readonly buildAsRoleArn : string;

  readonly slackWorkspaceId: string;

  readonly slackChannelNamePrefix: string;
}
