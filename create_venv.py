import os
from utils import subprocess_check_output

thispath = os.path.dirname(os.path.abspath(__file__))
venv_path = os.path.join(thispath, venv)

# if you dont have the virtual environment then create it
if os.path.isdir(venv_path) is False:
    subprocess_check_output(['python3', '-m', 'venv', 'venv'])

# activate the virtual environment
subprocess_check_output(['source', 'venv/bin/activate'])
# install required python packages packages
subprocess_check_output(['pip3', 'install', '-r', 'requirements.txt'])