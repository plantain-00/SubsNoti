#!/usr/bin/env bash

# cd
export NODE_ENV=development

# git pull
# echo 'Starting "git pull"...'
# git reset --hard
# git pull
# echo 'Finished "git pull".'

# install
echo 'Starting "npm install"...'
npm install
echo 'Finished "npm install".'

# compile gulpfile.ts
echo 'Starting "tsc gulpfile.ts"...'
tsc
echo 'Finished "tsc gulpfile.ts".'

# gulp task clean
echo 'Starting "gulp clean"...'
gulp clean
echo 'Finished "gulp clean".'

# compile gulpfile.ts
echo 'Starting "tsc gulpfile.ts"...'
tsc
echo 'Finished "tsc gulpfile.ts".'

## gulp task make
echo 'Starting "gulp make"...'
gulp make
echo 'Finished "gulp make".'
