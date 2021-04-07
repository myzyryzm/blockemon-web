#!/bin/bash

docker build -t 846558801598.dkr.ecr.us-west-2.amazonaws.com/nginx_modsecurity:latest .
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 846558801598.dkr.ecr.us-west-2.amazonaws.com
docker push 846558801598.dkr.ecr.us-west-2.amazonaws.com/nginx_modsecurity:latest