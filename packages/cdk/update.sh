#!/bin/bash

cd "$(dirname "$0")" || exit 1

node_modules/.bin/cdk deploy --require-approval never MainStack
