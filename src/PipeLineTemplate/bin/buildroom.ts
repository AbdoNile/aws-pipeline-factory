#!/usr/bin/env node
require('dotenv').config();
import * as cdk from '@aws-cdk/core';
import { BuildroomStack } from '../lib/buildroom-stack';
import { BuildOperationsDetails } from '../lib/buildOperationsDetails';

const app = new cdk.App();
const  buildOperationsDetails : BuildOperationsDetails = {
    "githubRepositoryName" : `${process.env.githubRepositoryName}`,
    "githubRepositoryOwner" :`${process.env.githubRepositoryOwner}`,
    "githubRepositoryBranch" :`${process.env.githubRepositoryBranch}`,
    "projectName" : `${process.env.githubRepositoryName}-${process.env.githubRepositoryBranch}`,
    "buildSpecFileRelativeLocation" : "frontend/build/codebuild.spec.yml",
    "artifactsBucket" : "salt-sandbox-abdo-artifacts",
    "buildAsRole" : "arn:aws:iam::928065939415:role/PipeLine-Factory-CodebuildRunner",
    "gitHubTokenSecretName" :  "githubtoken"
}

const stackName = `LPF-${buildOperationsDetails.projectName}`
new BuildroomStack(app, stackName, buildOperationsDetails);
