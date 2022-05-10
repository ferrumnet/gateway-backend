#!/bin/bash
source /root/set_env.sh

# api
if [ ${Environment} == dev ] && [ ${DEPLOYMENT_GROUP_NAME} == gateway-backend-dev-api-dg ]
then

echo API

docker stop ${AppName}-${Environment}-api || true
docker system prune -a -f || true
aws ecr get-login-password --region ${Region} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
docker run -d -it --name ${AppName}-${Environment}-api  -p 80:8080 --restart unless-stopped ${ECR_REGISTRY}:latest node server.js dev api


# cron

elif [ $Environment == dev ] && [ ${DEPLOYMENT_GROUP_NAME} == gateway-backend-dev-cron-dg ]
then

echo CRON

docker stop ${AppName}-${Environment}-cron || true
docker system prune -a -f || true
aws ecr get-login-password --region ${Region} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
docker run -d -it --name ${AppName}-${Environment}-cron -p 8080:8080 --restart unless-stopped ${ECR_REGISTRY}:latest node server.js dev cron


# feature branch
else

echo FEATURE

docker stop ${AppName}-${Environment}-api || true
docker stop ${AppName}-${Environment}-cron || true
docker system prune -a -f || true
aws ecr get-login-password --region ${Region} | docker login --username AWS --password-stdin ${AccountId}.dkr.ecr.${Region}.amazonaws.com/${REPO}
docker run -d -it --name ${AppName}-${Environment}-api  -p 80:8080 --restart unless-stopped ${AccountId}.dkr.ecr.${Region}.amazonaws.com/${REPO}:latest node server.js dev api
docker run -d -it --name ${AppName}-${Environment}-cron -p 8080:8080 --restart unless-stopped ${AccountId}.dkr.ecr.${Region}.amazonaws.com/${REPO}:latest node server.js dev cron
fi