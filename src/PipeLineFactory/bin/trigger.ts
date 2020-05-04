#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TriggerStack } from '../lib/trigger-stack';
import FactoryProperties from  '../lib/factoryProperties'

const stageDev = { account: '928065939415', region: 'eu-west-1' };

const projectName : string = "PipeLine-Factory"
const factoryProperties : FactoryProperties = {
    githubRepositoryBranch : "master",
    githubRepositoryName : "pipeline-factory",
    githubRepositoryOwner : "stage-tech",
    projectName : projectName,
    env : stageDev,
    defaultArtifactsBucket : "salt-deployment-packages",
    default_github_token_secret_name : "GitHubToken"

}
const app = new cdk.App();
new TriggerStack(app,projectName , factoryProperties);
