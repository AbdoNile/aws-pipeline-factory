#!/usr/bin/env node
require('dotenv').config();
import * as cdk from '@aws-cdk/core';
import {Utility}  from './utility';
import { BuildRoomStack } from '../lib/buildroom-stack';
import { BuildOperationsDetails } from '../lib/buildOperationsDetails';
const app = new cdk.App();

const projectName = Utility.sanitizeStackName(`${process.env.GITHUB_REPOSITORY_NAME}-${process.env.GITHUB_REPOSITORY_BRANCH}`).toLowerCase();
const  buildOperationsDetails : BuildOperationsDetails = {
    "githubRepositoryName" : `${process.env.GITHUB_REPOSITORY_NAME}`,
    "githubRepositoryOwner" :`${process.env.GITHUB_REPOSITORY_OWNER}`,
    "githubRepositoryBranch" :`${process.env.GITHUB_REPOSITORY_BRANCH}`,
    "buildSpecFileRelativeLocation" : `${process.env.BUILD_SPEC_RELATIVE_LOCATION}`,
    "artifactsBucket" : `${process.env.ARTIFACTS_BUCKET}` ,
    "gitHubTokenSecretName" :  `${process.env.GITHUB_TOKEN_SECRETNAME}`,
    "buildAsRoleArn" : `${process.env.BUILD_AS_ROLE_ARN}`,
    projectName : projectName
   
}
console.log(buildOperationsDetails)
const stackName = `PLF-${projectName}`
new BuildRoomStack(app, stackName, buildOperationsDetails);
