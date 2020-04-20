#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TriggerStack } from '../lib/trigger-stack';

const app = new cdk.App();
new TriggerStack(app, 'PipeLine-Factory');
