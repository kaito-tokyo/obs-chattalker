#!/bin/bash

cd "$(dirname "$0")" || exit 1

npx cdk destroy
