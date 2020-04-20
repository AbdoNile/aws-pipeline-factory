#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TriggerStack } from '../lib/trigger-stack';

const stageDev = { account: '928065939415', region: 'eu-west-1' };
const app = new cdk.App();
new TriggerStack(app, 'PipeLine-Factory', {env : stageDev});
