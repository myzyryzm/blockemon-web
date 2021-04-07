#!bin/bash

deploy_type=$1

cd frontend
npm run build-$deploy_type