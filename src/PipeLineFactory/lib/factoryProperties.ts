import * as cdk from "@aws-cdk/core";

export default class FactoryProperties implements cdk.StackProps {
  readonly pipelineTemplateRepositoryName: string;
  
  readonly pipelineTemplateGithubOwner: string;
  
  readonly pipelineTemplateBranchName: string;
  
  readonly projectName: string;
  
  readonly tags?: {[key: string]: string; };
  
  readonly env?: cdk.Environment;

  readonly defaultArtifactsBucket : string;

  readonly default_github_token_secret_name: string
  
  readonly apiDomainName?: string;
  
  readonly apiDomainCertificateArn?: string;

  readonly slackWorkspaceId: string;

  readonly slackChannelNamePrefix: string;
  
  readonly triggerCodeS3Bucket: string;
  
  readonly triggerCodeS3Key: string;
  
}
