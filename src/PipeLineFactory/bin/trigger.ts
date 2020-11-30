#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { TriggerStack } from "../lib/trigger-stack";
import FactoryProperties from "../lib/factoryProperties";
const app = new cdk.App();

const s3_lambda_object_key = app.node.tryGetContext("s3_lambda_object_key");
const s3_bucket_name = app.node.tryGetContext("s3_bucket_name");
console.log(
  `s3_lambda_object_key ${s3_lambda_object_key} , s3_bucket_name ${s3_bucket_name} `
);
const projectName: string = "PLF";
const factoryProperties: FactoryProperties = {
  githubRepositoryBranch: "master",
  githubRepositoryName: "pipeline-factory",
  githubRepositoryOwner: "stage-tech",
  projectName: projectName,
  defaultArtifactsBucket: "salt-deployment-packages",
  default_github_token_secret_name: "/global/GitHubToken",
  slackWorkspaceId: "T5J1W20JV",
  slackChannelNamePrefix: "sphinx-env-",
  triggerCodeS3Bucket: s3_bucket_name,
  triggerCodeS3Key: s3_lambda_object_key,
};
new TriggerStack(app, projectName, factoryProperties);
