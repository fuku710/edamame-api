#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EdamameApiStack } from '../lib/edamame-api-stack';

const app = new cdk.App();
new EdamameApiStack(app, 'EdamameApiStack');
