#!/bin/bash

# *** Change this to the desired name of the Cloudformation stack of
# your Pipeline (*not* the stack name of your app)
GITHUB_OWNER="sheraz-ferrum"
GITHUB_REPO="gateway-backend"
# for branch can only contain lowercase letters, numbers, hyphens, underscores, and forward slashes
GITHUB_BRANCH="cicd_configuration"
GITHUB_OAUTH_TOKEN=$1
DEV_PREFIX="sheraz"
APP_NAME="gateway-backend"
ENVIRONMENT="dev"
CODEPIPELINE_STACK_NAME="${DEV_PREFIX}${APP_NAME}-${ENVIRONMENT}-pipeline"
DEFAULT_VPC=$(aws ec2 describe-vpcs --region us-east-2  \
    --filters Name=isDefault,Values=true \
    --query 'Vpcs[*].VpcId' \
    --output text)
SUBNET_A=$(aws ec2 describe-subnets --region us-east-2 --filter Name=vpc-id,Values=$DEFAULT_VPC --query 'Subnets[0].SubnetId')
SUBNET_B=$(aws ec2 describe-subnets --region us-east-2 --filter Name=vpc-id,Values=$DEFAULT_VPC --query 'Subnets[1].SubnetId')
SUBNET_C=$(aws ec2 describe-subnets --region us-east-2 --filter Name=vpc-id,Values=$DEFAULT_VPC --query 'Subnets[2].SubnetId')



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
							 ParameterKey=VPC,ParameterValue=${DEFAULT_VPC} \
               ParameterKey=SubnetA,ParameterValue=${SUBNET_A} \
               ParameterKey=SubnetB,ParameterValue=${SUBNET_B} \
               ParameterKey=SubnetC,ParameterValue=${SUBNET_C} \
  --template-body file://pipeline.yaml

sleep 10

aws wait cloudforamtion stack-create-complete \
  --stack-name $CODEPIPELINE_STACK_NAME