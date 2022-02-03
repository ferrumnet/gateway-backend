#!/bin/bash
GITHUB_OWNER="ferrum"
GITHUB_REPO="hello-world"
GITHUB_BRANCH="master"
GITHUB_OAUTH_TOKEN=$1
DEV_PREFIX="jdoe-"
APP_NAME="leaderboard"
ENVIRONMENT="dev"
CODEPIPELINE_STACK_NAME="${DEV_PREFIX}${APP_NAME}-${ENVIRONMENT}-pipeline"

if [ -z ${1} ]
then
	echo "PIPELINE CREATION FAILED!"
        echo "Pass your Github OAuth token as the first argument"
	exit 1
fi

set -eu

aws cloudformation validate-template --template-body file://pipeline.yaml

aws cloudformation update-stack \
        --capabilities CAPABILITY_IAM \
        --stack-name $CODEPIPELINE_STACK_NAME \
				--parameters ParameterKey=DevPrefix,ParameterValue=${DEV_PREFIX} \
										 ParameterKey=GitHubOwner,ParameterValue=${GITHUB_OWNER} \
										 ParameterKey=GitHubRepo,ParameterValue=${GITHUB_REPO} \
										 ParameterKey=GitHubBranch,ParameterValue=${GITHUB_BRANCH} \
				             ParameterKey=GitHubOAuthToken,ParameterValue=${GITHUB_OAUTH_TOKEN} \
										 ParameterKey=AppName,ParameterValue=${APP_NAME} \
										 ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
			  --template-body file://pipeline.yaml
