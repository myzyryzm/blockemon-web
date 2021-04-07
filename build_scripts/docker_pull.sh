#!bin/bash

docker_owner=$1
docker_image=$2
docker pull "$docker_owner"/"$docker_image":latest