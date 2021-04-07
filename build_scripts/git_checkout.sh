#!bin/bash

branch_type=$1

git remote update 
git checkout $branch_type
git pull $branch_type