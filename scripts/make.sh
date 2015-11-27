#!/usr/bin/env bash

# cd
export NODE_ENV=development

# echo 'Starting "git pull"...'
# git reset --hard
# git pull
# echo 'Finished "git pull".'

npm install && tsc && gulp clean && tsc && gulp make
