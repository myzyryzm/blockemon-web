#!/bin/bash
# same as build_and_deploy.py except that it activates the virtual environment and ensures everything is installed

python3 create_venv.py
python3 build_and_deploy.py $@