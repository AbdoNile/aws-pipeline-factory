#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TriggerStack } from '../lib/trigger-stack';
import FactoryProperties from  '../lib/factoryProperties'

const stageDev = { account: '928065939415', region: 'eu-west-1' };
const app = new cdk.App();

const s3_lambda_object_key = app.node.tryGetContext('s3_lambda_object_key');
const s3_bucket_name = app.node.tryGetContext('s3_bucket_name');
console.log(`s3_lambda_object_key ${s3_lambda_object_key} , s3_bucket_name ${s3_bucket_name} `)
const projectName : string = "PipeLine-Factory"
const factoryProperties : FactoryProperties = {
    githubRepositoryBranch : "master",
    githubRepositoryName : "pipeline-factory",
    githubRepositoryOwner : "stage-tech",
    projectName : projectName,
    env : stageDev,
    defaultArtifactsBucket : "salt-deployment-packages",
    default_github_token_secret_name : "/global/GitHubToken",
    apiDomainCertificateArn : "arn:aws:acm:eu-west-1:928065939415:certificate/257976ea-e9ff-4a05-8dba-a034f2228326",
    apiDomainName : "pipeline-factory.tools.salt-dev.ws",
    slackWorkspaceId: "T5J1W20JV",
    slackChannelNamePrefix: "sphinx-env-",
    triggerCodeS3Bucket : s3_bucket_name,
    triggerCodeS3Key : s3_lambda_object_key
}
new TriggerStack(app,projectName , factoryProperties);
