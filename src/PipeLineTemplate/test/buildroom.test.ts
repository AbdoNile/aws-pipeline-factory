import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import Buildroom = require('../lib/buildroom-stack');
import { BuildOperationsDetails } from '../lib/buildOperationsDetails';
const buildOperationsDetails :BuildOperationsDetails= {
  "githubRepositoryName" : "AngleRunner",
  "githubRepositoryOwner" : "AbdoNile",
  "githubRepositoryBranch" : "dev",
  "projectName" : "AngleRunnerViaCDK",
  "buildSpecFileRelativeLocation" : "frontend/build/codebuild.spec.yml",
  "artifactsBucket" : "anglerunner-artifacts",
  "buildAsRole" : "test",
  "gitHubTokenSecretName" :  "githubtoken"

};

test('SQS Queue Created', () => {
    const app = new cdk.App();
       // WHEN
    const stack = new Buildroom.BuildroomStack(app, 'MyTestStack', buildOperationsDetails);
    // THEN
    expectCDK(stack).to(haveResource("AWS::SQS::Queue",{
      VisibilityTimeout: 300
    }));
});

test('SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Buildroom.BuildroomStack(app, 'MyTestStack', buildOperationsDetails);
  // THEN
  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
});
