#!bin/bash

docker_owner=$1
docker_image=$2
docker tag "$docker_owner"/"$docker_image":latest "$docker_owner"/"$docker_image":previous
docker build -t "$docker_owner"/"$docker_image":latest .