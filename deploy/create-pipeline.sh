#!/bin/bash

# *** Change this to the desired name of the Cloudformation stack of
# your Pipeline (*not* the stack name of your app)
GITHUB_OWNER="sheraz-ferrum"
GITHUB_REPO="gateway-backend"
GITHUB_BRANCH="CI/CD"
GITHUB_OAUTH_TOKEN=$1
DEV_PREFIX="sheraz-"
APP_NAME="ferrum-gateway"
ENVIRONMENT="dev"
CODEPIPELINE_STACK_NAME="${DEV_PREFIX}${APP_NAME}-${ENVIRONMENT}-pipeline"

if [ -z ${1} ]
then
	echo "PIPELINE CREATION FAILED!"
        echo "Pass your Github OAuth token as the first argument"
	exit 1
fi

set -eu

aws cloudformation create-stack --region us-east-2 \
  --capabilities CAPABILITY_NAMED_IAM \
  --stack-name $CODEPIPELINE_STACK_NAME \
  --parameters ParameterKey=DevPrefix,ParameterValue=${DEV_PREFIX} \
	             ParameterKey=GitHubOwner,ParameterValue=${GITHUB_OWNER} \
							 ParameterKey=GitHubRepo,ParameterValue=${GITHUB_REPO} \
							 ParameterKey=GitHubBranch,ParameterValue=${GITHUB_BRANCH} \
	             ParameterKey=GitHubOAuthToken,ParameterValue=${GITHUB_OAUTH_TOKEN} \
							 ParameterKey=AppName,ParameterValue=${APP_NAME} \
							 ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
  --template-body file://pipeline.yaml

sleep 10

aws wait cloudforamtion stack-create-complete \
  --stack-name $CODEPIPELINE_STACK_NAME
