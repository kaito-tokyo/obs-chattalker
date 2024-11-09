#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { MainStack } from "../lib/MainStack.js";

const app = new cdk.App();

new MainStack(app, "MainStack", {
	env: {
		account: "586794439382",
		region: "us-east-1"
	}
});

app.synth();
