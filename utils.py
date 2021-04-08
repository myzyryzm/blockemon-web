import subprocess

def subprocess_check_output(args, kwargs={}):
    assert isinstance(args,list) or isinstance(args,tuple), str(type(args))
    failed = False
    if 'stderr' not in kwargs:
        kwargs['stderr'] = subprocess.STDOUT
    args = [str(arg) for arg in args]
    print("running: \'"+str(' '.join(args))+"\'")
    
    try:
        ret = subprocess.check_output(args, **kwargs) # return code would always be zero, would fail otherwise
        print(ret)
    except subprocess.CalledProcessError as eee:
        mymsg = "failed command:\n"+str(args)+"\n" \
               +str(eee.output.decode('utf-8'))
        ret = "WARNING: subprocess_check_output: "+mymsg
        failed = True
    
    if isinstance(ret,bytes):
        ret = ret.decode('utf-8')
    return ret, failed