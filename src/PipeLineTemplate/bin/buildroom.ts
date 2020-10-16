#!/usr/bin/env node
require('dotenv').config();
import * as cdk from '@aws-cdk/core';
import {Utility}  from './utility';
import { BuildRoomStack } from '../lib/buildroom-stack';
import { BuildOperationsDetails } from '../lib/buildOperationsDetails';
const stageDev = { account: '928065939415', region: 'eu-west-1' };
const app = new cdk.App();

const projectName = Utility.sanitizeStackName(`${process.env.GITHUB_REPOSITORY_NAME}-${process.env.GITHUB_REPOSITORY_BRANCH}`).toLowerCase();
const  buildOperationsDetails : BuildOperationsDetails = {
    "githubRepositoryName" : `${process.env.GITHUB_REPOSITORY_NAME}`,
    "githubRepositoryOwner" :`${process.env.GITHUB_REPOSITORY_OWNER}`,
    "githubRepositoryBranch" :`${process.env.GITHUB_REPOSITORY_BRANCH}`,
    "projectName" :  projectName,
    "buildSpecFileRelativeLocation" : `${process.env.BUILD_SPEC_RELATIVE_LOCATION}`,
    "artifactsBucket" : `${process.env.ARTIFACTS_BUCKET}` ,
    "gitHubTokenSecretName" :  `${process.env.GITHUB_TOKEN_SECRETNAME}`,
    "artifactsPrefix" : `${process.env.ARTIFACTS_PREFIX}`,
    "transientArtifactsBucketName" : `${process.env.TRANSIENT_ARTIFACTS_BUCKET_NAME}`,
    "buildAsRoleArn" : `${process.env.BUILD_AS_ROLE_ARN}`,
    "slackWorkspaceId" : `${process.env.SLACK_WORKSPACE_ID}`,
    "slackChannelNamePrefix" : `${process.env.SLACK_CHANNEL_NAME_PREFIX}`,
    "env" : {
        "account": "928065939415",
         "region": "eu-west-1"
         }
}
console.log(buildOperationsDetails)
const stackName = `PLF-${projectName}`
new BuildRoomStack(app, stackName, buildOperationsDetails);
