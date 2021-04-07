import argparse
import sys
import subprocess
import os
import json
import yaml
import requests

build_folder = 'build_scripts'
thispath = os.path.dirname(os.path.abspath(__file__))
buildpath = os.path.join(thispath, build_folder)
ebpath = '/var/app/current/'
dc_base = 'docker-compose.base.yml'
dc = 'docker-compose.yml'
dc_env_file = 'dc_envs.env'
misc_env_file = 'misc.env'
docker_owner = '778784628106.dkr.ecr.us-west-2.amazonaws.com'

def subprocess_check_output(args, kwargs={}, assert_hard=False, printcmd:bool=True):
    assert isinstance(args,list) or isinstance(args,tuple), str(type(args))
    failed = False
    if 'stderr' not in kwargs:
        kwargs['stderr'] = subprocess.STDOUT
    args = [str(arg) for arg in args]
    if printcmd:
        print("running: \'"+str(' '.join(args))+"\'")
    
    try:
        ret = subprocess.check_output(args, **kwargs) # return code would always be zero, would fail otherwise
        print('ret')
        print(ret)
    except subprocess.CalledProcessError as eee:
        mymsg = "failed command:\n"+str(args)+"\n" \
               +str(eee.output.decode('utf-8'))
        if assert_hard:
            assert 0, mymsg
        ret = "WARNING: subprocess_check_output: "+mymsg
        # print(ret)
        #raise subprocess.CalledProcessError
        failed = True
    
    if isinstance(ret,bytes):
        ret = ret.decode('utf-8')
    return ret, failed

def get_envs(env_file):
    envs = []
    with open(env_file,'r') as infile:
        for line in infile:
            line = line.strip('\r\n\t ')
            if line.startswith( 'export '):
                line = line[len('export '):]
                if len(line) > 1 and '=' in line:
                    lkey,lval = line.split('=',1)
                    if lval.startswith('\"') and lval.endswith('\"'):
                        lval = lval[1:-1]
                    if len(lval) > 0:
                        env = {
                            'name': lkey,
                            'value': lval
                        }
                        envs.append(env)
    return envs

def _deploy(deploy_url):
    deploy = ['eb', 'deploy']
    ret, failed = subprocess_check_output(deploy)
    return ret, failed

parser = argparse.ArgumentParser()
parser.add_argument('--production', action='store_true',
                    help='add this flag if you are deploying to production')
parser.add_argument('--rollback', action='store_true',
                    help='reverts to the previous deployment')
parser.add_argument('--git_checkout', action='store_true',
                    help='add this flag if you want to ensure you are on the right branches')
parser.add_argument('--git_update', action='store_true',
                    help='add this flag if you want to ensure all repos are up to date')
parser.add_argument('--git_full', action='store_true',
                    help='combines --git_checkout and --git_update')
parser.add_argument('--npm_install', action='store_true',
                    help='add this flag if you wish to npm install')
parser.add_argument('--npm_build', action='store_true',
                    help='builds the frontend')
parser.add_argument('--npm_full', action='store_true',
                    help='combines --npm_install and --npm_build')
parser.add_argument('--docker_pull', action='store_true',
                    help='pulls the latest and previous docker images')
parser.add_argument('--docker_build', action='store_true',
                    help='build the docker image')
parser.add_argument('--docker_push', action='store_true',
                    help='pushes the docker image to ECR')
parser.add_argument('--docker_full', action='store_true',
                    help='combines --docker_pull --docker_build and --docker_push')
parser.add_argument('--eb_local', action='store_true',
                    help='create docker-compose.yml to run locally')
parser.add_argument('--eb_staging', action='store_true',
                    help='creates docker-compose.yml to be run off staging/deployment EC2')
parser.add_argument('--eb_deploy',action='store_true',
                    help='deploys to elastic beanstalk')
parser.add_argument('--env_type', type=str, default='qa',
                    help='type of environment you wish to update')
args = parser.parse_args()

args = parser.parse_args()

deploy_type = args.env_type
if args.production:
    deploy_type = 'prod'
deploy_url = f'https://blockemon-{deploy_type}.us-west-2.elasticbeanstalk.com'

# CHECKING TO MAKE SURE THE ENV_TYPE IS THE SAME AS THE ELASTIC BEANSTALK ENVIRONMENT
status = ['eb', 'status']
ret, failed = subprocess_check_output(status)
if failed is True:
    print(ret)
    quit(400)
try:
    eb_type = ((ret.split('Environment details for: ')[-1]).split('\n')[0]).split('-')[-1]
    if eb_type != deploy_type:
        print(f'ERROR: eb_type: {eb_type} != deploy_type: {deploy_type}')
        quit(400)
except:
    print('unable to parse environment from eb status')
    quit(400)
    
rollback = args.rollback
image_type = 'previous' if rollback is True else 'latest'
docker_base = f'blockemon_{deploy_type}'
docker_image = f'{docker_owner}/{docker_base}:{image_type}'
nginx_image = f'{docker_owner}/nginx_modsecurity:latest'
git_checkout = args.git_checkout

npm_install = args.npm_install
npm_build = args.npm_build
if args.npm_full is True:
    npm_install = True
    npm_build = True

docker_pull = args.docker_pull
docker_build = args.docker_build
docker_push = args.docker_push
if args.docker_full is True:
    docker_pull = True
    docker_build = True
    docker_push = True
docker_login = docker_pull or docker_build or docker_push

eb_local = args.eb_local
eb_staging = args.eb_staging
eb_deploy = args.eb_deploy

deploy_push_error = False if eb_deploy == docker_push else True
error_msg = None
if eb_deploy is True and (eb_local is True or eb_staging):
    error_msg = 'CANNOT CREATE LOCAL AND AWS VERSION OF WEBSITE IN SAME BUILD PROCESS'
elif deploy_push_error is True:
    error_msg = 'ERROR: FOR SAFETY REASONS CANNOT DEPLOY TO ELASTIC BEANSTALK IF NOT PUSHING TO DOCKER AND VICE VERSA'
elif docker_build is False and npm_build is True:
    error_msg = 'NO POINT NPM BUILDING W/O DOCKER BUILDING'
elif npm_install is True and npm_build is False:
    error_msg = 'NO POINT INSTALLING NODE MODULES W/O NPM BUILDING'

if error_msg is not None:
    print('\n')
    print(error_msg)
    print('\n')
    quit(400)

git_print = 'SKIPPING GIT CHECKOUT' if git_checkout is False else f'CHECKING OUT GIT BRANCH FOR {deploy_type}'
git_print = f'1) GIT: {git_print}'

frontend_print = 'INSTALLING NODE MODULES AND BUILDING FRONTEND'
if npm_build is False:
    frontend_print = 'SKIPPING FULL FRONTEND BUILD PROCESS'  
elif npm_install is False:
    frontend_print = 'SKIPPING NODE MODULES BUT BUILDING FRONTEND'
frontend_print = f'2) FRONTEND: {frontend_print}'

pull_txt = 'PULLING' if docker_pull is True else 'NOT PULLING'
bld_txt = 'BUILDING' if docker_build is True else 'NOT BUILDING'
push_txt = 'PUSHING' if docker_push is True else 'NOT PUSHING'
docker_print = f'3) DOCKER: {pull_txt} && {bld_txt} && {push_txt}'

deploy_print = 'SKIPPING DEPLOYMENT'
if eb_local is True:
    deploy_print = 'CREATING LOCAL VERSION'
elif eb_staging is True:
    deploy_print = 'CREATING STAGING VERSION'
elif eb_deploy is True:
    deploy_print = 'DEPLOYING TO ELASTIC BEANSTALK'
deploy_print = f'4) DEPLOYMENT: {deploy_print}'

print('\n')
print(f'DEPLOYING {deploy_type.upper()} : {image_type.upper()}')
print('\n')
if rollback is True:
    print('DEPLOYING TO PREVIOUS SO NO FURTHER STEPS WILL BE REACHED')
else:
    print(git_print)
    print(frontend_print)
    print(docker_print)
    print(deploy_print)
print('\n')

# CHECKING OUT GIT BRANCHES
if git_checkout is True:
    branch_type = 'quality-assurance' if deploy_type == 'qa' else 'master'
    git_checkout = ['sh', os.path.join(buildpath, 'git_checkout.sh'), branch_type]
    ret, failed = subprocess_check_output(git_checkout)
    if failed:
        print('unable to checkout branches')
        print(ret)
        quit(400)
        
# CREATING DOCKERRUN.AWS.JSON
jsonpath = os.path.join(buildpath, f'Dockerrun.aws.base.json')
if os.path.isfile(jsonpath) is False:
    print('no Dockerrun.aws.base.json; please create file and fill with appropriate values')
    quit(400)
    
deploy_json = {}
with open(jsonpath) as tf:
    deploy_json = json.load(tf)

env_file = os.path.join(buildpath, f'build.{deploy_type}.env')
if os.path.isfile(env_file) is False:
    print(f'no build env file {env_file}')
    quit(400)
    
staging_ip = ''
misc_env_path = os.path.join(buildpath, misc_env_file)
misc_envs = []
    
try:
    envs = get_envs(env_file)
    cmd = ['sh', '/home/startup.sh', deploy_url]
    deploy_json['containerDefinitions'][0]['image'] = nginx_image
    deploy_json['containerDefinitions'][1]['command'] = cmd
    deploy_json['containerDefinitions'][1]['image'] = docker_image
    deploy_json['containerDefinitions'][1]['environment'] += envs
except:
    print('something is wrong with Dockerrun.aws.base.json; get tf outta here')
    quit(400)

jsonpath = os.path.join(thispath, 'Dockerrun.aws.json')
with open(jsonpath, 'w') as tf:
    json.dump(deploy_json, tf)
print('\n')
print('DOCKERRUN.AWS.JSON CREATED')
print('\n')

# ROLLING BACK TO PREVIOUS DEPLOYMENT
if rollback is True:
    print(f'ROLLING BACK {deploy_type}')
    ret, failed = _deploy(deploy_url)
    if failed:
        print('UNABLE TO DEPLOY TO PREVIOUS')
        print(ret)
        quit(400)
    else:
        print('rollback successful')
        quit()

# BUILDING FRONTEND
if npm_build is True:
    node_modules = os.path.join(thispath, 'web', 'frontend', 'node_modules')
    has_nm = os.path.isdir(node_modules)
    if has_nm and npm_install is True:
        print('NPM install is true but already have node_modules; therefore deleting the old ones')
        frontend_delete = ['rm', '-rf', node_modules]
        ret, failed = subprocess_check_output(frontend_delete)
        if failed:
            print('unable to delete node modules')
            print(ret)
            quit(400)
    if npm_install is True:
        frontend_install = ['sh', os.path.join(buildpath, 'npm_install.sh'), deploy_type]
        ret, failed = subprocess_check_output(frontend_install)
        if failed:
            print('unable to install node modules')
            print(ret)
            quit(400)
    if npm_install is True:
        frontend_install = ['sh', os.path.join(buildpath, 'npm_install.sh'), deploy_type]
        ret, failed = subprocess_check_output(frontend_install)
        if failed:
            print('unable to install node modules')
            print(ret)
            quit(400)
    frontend_build = ['sh', os.path.join(buildpath, 'npm_build.sh'), deploy_type]
    ret, failed = subprocess_check_output(frontend_build)
    if failed:
        print('unable to build frontend')
        print(ret)
        quit(400)

# LOGGING INTO DOCKER
if docker_login is True:
    ret, failed = subprocess_check_output(['sh', os.path.join(buildpath, 'docker_login.sh')])
    if failed:
        print('unable to login to docker')
        quit(400)

# PULLING DOCKER
if docker_pull is True:
    ret, failed = subprocess_check_output(['sh', os.path.join(buildpath, 'docker_pull.sh'), 
                                           docker_owner, docker_base])
    if failed:
        print('unable to pull docker')
        print(ret)
        quit(400)

# BUILDING DOCKER
if docker_build is True:
    ret, failed = subprocess_check_output(['sh', os.path.join(buildpath, 'docker_build.sh'), 
                                           docker_owner, docker_base])
    if failed:
        print('unable to build docker')
        print(ret)
        quit(400)

# PUSHING DOCKER
if docker_push is True:
    ret, failed = subprocess_check_output(['sh', os.path.join(buildpath, 'docker_push.sh'), 
                                           docker_owner, docker_base])
    if failed:
        print('unable to deploy docker')
        print(ret)
        quit(400)

# CREATING DOCKER-COMPOSE.YML FOR LOCAL
if eb_local is True or eb_staging is True:
    print('creating docker-compose to run locally')
    dc_env_path = os.path.join(buildpath, dc_env_file)
    if os.path.isfile(dc_env_path) is False:
        print(f'no dc env file {dc_env_path}')
        quit(400)   
        
    dc_envs = get_envs(dc_env_path)
    dockerrun = {}
    with open(jsonpath, 'r') as tf:
        dockerrun = json.load(tf)

    vols = dockerrun['volumes']
    volumes = {}
    for v in vols:
        volumes[v['name']] = os.path.join(thispath, (v['host']['sourcePath']).split(ebpath)[-1])
    
    nginx_image = dockerrun['containerDefinitions'][0]['image']
    nginx_mounts = dockerrun['containerDefinitions'][0]['mountPoints']
    nginx_volumes = [volumes[d['sourceVolume']] + ':' + d['containerPath'] for d in nginx_mounts]

    web_command = ['sh', '/home/startup.sh']
    web_mounts = dockerrun['containerDefinitions'][1]['mountPoints']
    web_volumes = [volumes[d['sourceVolume']] + ':' + d['containerPath'] for d in web_mounts]
    web_envs = {}
    for e in dockerrun['containerDefinitions'][1]['environment']:
        web_envs[e['name']] = e['value']
    for e in dc_envs:
        name = e['name']
        value = e['value']
    
    dockercompose = {}
    with open(os.path.join(buildpath, dc_base), 'r') as tf:
        dockercompose = yaml.load(tf, Loader=yaml.FullLoader)
        
    dockercompose['nginx']['image'] = nginx_image
    dockercompose['nginx']['volumes'] = nginx_volumes
    dockercompose['web']['command'] = web_command
    dockercompose['web']['image'] = docker_image
    dockercompose['web']['volumes'] = web_volumes
    dockercompose['web']['environment'] = web_envs
    dc = os.path.join(thispath, dc)
    if os.path.isfile(dc):
        print(f'already have {dc} so no need to make new one')
    else:
        print(f'making file {dc}')
        ret, failed = subprocess_check_output(['touch', dc])
        
    with open(dc, 'w') as tf:
        yaml.dump(dockercompose, tf)

# DEPLOYING TO ELASTIC BEANSTALK
if eb_deploy is True:
    ret, failed = _deploy(deploy_url)
    if failed:
        print('unable to deploy')
        print(ret)
        quit(400)