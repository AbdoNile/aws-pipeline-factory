#!/usr/bin/env node
require('dotenv').config();
import * as cdk from '@aws-cdk/core';
import { BuildroomStack } from '../lib/buildroom-stack';
import { BuildOperationsDetails } from '../lib/buildOperationsDetails';
const stageDev = { account: '928065939415', region: 'eu-west-1' };
const app = new cdk.App();
const  buildOperationsDetails : BuildOperationsDetails = {
    "githubRepositoryName" : `${process.env.githubRepositoryName}`,
    "githubRepositoryOwner" :`${process.env.githubRepositoryOwner}`,
    "githubRepositoryBranch" :`${process.env.githubRepositoryBranch}`,
    "projectName" : `${process.env.githubRepositoryName}-${process.env.githubRepositoryBranch}`,
    "buildSpecFileRelativeLocation" : `${process.env.buildSpecFileRelativeLocation}`,
    "artifactsBucket" : `${process.env.artifactsBucket}` ,
    "buildAsRole" : "arn:aws:iam::928065939415:role/PipeLine-Factory-CodebuildRunner",
    "gitHubTokenSecretName" :  `${process.env.gitHubTokenSecretName}`,
    "env" : {
        "account": "928065939415",
         "region": "eu-west-1"
         }
}

const stackName = `PLF-${buildOperationsDetails.projectName}`
new BuildroomStack(app, stackName, buildOperationsDetails);
