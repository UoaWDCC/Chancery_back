#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ChanceryStack } from '../lib/chancery-stack';

const app = new cdk.App();
new ChanceryStack(app, 'ChanceryStack');
