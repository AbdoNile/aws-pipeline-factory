#!/usr/bin/env node
require('dotenv').config();
import * as cdk from '@aws-cdk/core';
import {Utility}  from './utility';
import { BuildroomStack } from '../lib/buildroom-stack';
import { BuildOperationsDetails } from '../lib/buildOperationsDetails';
const stageDev = { account: '928065939415', region: 'eu-west-1' };
const app = new cdk.App();
const  buildOperationsDetails : BuildOperationsDetails = {
    "githubRepositoryName" : `${process.env.GITHUB_REPOSITORY_NAME}`,
    "githubRepositoryOwner" :`${process.env.GITHUB_REPOSITORY_OWNER}`,
    "githubRepositoryBranch" :`${process.env.GITHUB_REPOSITORY_BRANCH}`,
    "projectName" :  Utility.sanitizeStackName(`${process.env.GITHUB_REPOSITORY_NAME}-${process.env.GITHUB_REPOSITORY_BRANCH}`),
    "buildSpecFileRelativeLocation" : `${process.env.BUILD_SPEC_RELATIVE_LOCATION}`,
    "artifactsBucket" : `${process.env.ARTIFACTS_BUCKET}` ,
    "buildAsRole" : "arn:aws:iam::928065939415:role/PipeLine-Factory-CodebuildRunner",
    "gitHubTokenSecretName" :  `${process.env.GITHUB_TOKEN_SECRETNAME}`,
    "artifactsPrefix" : `${process.env.ARTIFACTS_PREFIX}`,
    "env" : {
        "account": "928065939415",
         "region": "eu-west-1"
         }
}

const stackName = `PLF-${buildOperationsDetails.projectName}`
new BuildroomStack(app, stackName, buildOperationsDetails);
