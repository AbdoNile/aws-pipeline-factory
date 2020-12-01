#!/usr/bin/env node
require("dotenv").config();
import * as cdk from "@aws-cdk/core";
import { Utility } from "./utility";
import { BuildOperationsDetails, BuildRoomStack } from "../lib/buildroom-stack";
const app = new cdk.App();
console.log(app.account)
const projectName = Utility.sanitizeStackName(
  `${process.env.GITHUB_REPOSITORY_NAME}-${process.env.GITHUB_REPOSITORY_BRANCH}`
).toLowerCase();

function ensureEnvironmentVariable(variableName: string): string {
  if (!process.env[variableName] || process.env[variableName] == undefined) {
    throw new Error(`env variable ${variableName} is not defined`);
  }
  return process.env[variableName] || "";
}

const buildOperationsDetails: BuildOperationsDetails = {
  githubRepositoryName: ensureEnvironmentVariable(`GITHUB_REPOSITORY_NAME`),
  githubRepositoryOwner: ensureEnvironmentVariable("GITHUB_REPOSITORY_OWNER"),
  githubRepositoryBranch: ensureEnvironmentVariable("GITHUB_REPOSITORY_BRANCH"),
  buildAsRoleArn: ensureEnvironmentVariable("BUILD_AS_ROLE_ARN"),
  buildSpecFileRelativeLocation: process.env.BUILD_SPEC_RELATIVE_LOCATION,
  gitHubTokenSecretName: process.env.GITHUB_TOKEN_SECRETNAME,
  artifactsBucket: process.env.ARTIFACTS_BUCKET,
  projectName: projectName,
};
const stackName = `PLF-${projectName}`;
new BuildRoomStack(app, stackName, buildOperationsDetails);
