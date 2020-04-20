#!/usr/bin/env node
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
    "artifactsBucket" : "anglerunner-artifacts",
    "buildAsRole" : "arn:aws:iam::101584550521:role/service-role/codebuild-AngleRunner-service-role",
    "gitHubTokenSecretName" :  "githubtoken"
}

const stackName = `${buildOperationsDetails.projectName}-${buildOperationsDetails.githubRepositoryBranch}`
new BuildroomStack(app, stackName, buildOperationsDetails);
