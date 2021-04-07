#!bin/bash

docker_owner=$1
docker_image=$2
docker push "$docker_owner"/"$docker_image":previous
docker push "$docker_owner"/"$docker_image":latest