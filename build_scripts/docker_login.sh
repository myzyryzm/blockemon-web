#!/bin/bash

docker_owner=$1

aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin $docker_owner