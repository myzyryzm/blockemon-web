#!/bin/bash

cp -R /home/build/static /home # moves static files so nginx can serve them
cd /home/backend && npm run prod