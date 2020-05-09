#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TriggerStack } from '../lib/trigger-stack';
import FactoryProperties from  '../lib/factoryProperties'


const projectName : string = "AXTY-PipeLine-Factory"
const factoryProperties : FactoryProperties = {
    githubRepositoryBranch : "master",
    githubRepositoryName : "aws-pipeline-factory",
    githubRepositoryOwner : "AbdoNile",
    projectName : projectName,
    defaultArtifactsBucket : "anglerunner-artifacts",
    default_github_token_secret_name : "GitHubToken"

}
const app = new cdk.App();
new TriggerStack(app,projectName , factoryProperties);
