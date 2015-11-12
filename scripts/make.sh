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
echo 'Starting "npm tsc"...'
npm tsc
echo 'Finished "npm tsc".'

# gulp task clean
echo 'Starting "gulp clean"...'
gulp clean
echo 'Finished "gulp clean".'

# compile
echo 'Starting "tsc"...'
npm tsc
npm frontends
npm backends
echo 'Finished "tsc".'

# test
echo 'Starting "test"...'
npm tests
echo 'Finished "test".'

# gulp tasks
echo 'Starting "css"...'
gulp css
echo 'Finished "css".'

echo 'Starting "js"...'
gulp js
echo 'Finished "js".'

echo 'Starting "rev"...'
gulp rev
echo 'Finished "rev".'

echo 'Starting "html"...'
gulp html
echo 'Finished "html".'

echo 'Starting "doc"...'
gulp doc
echo 'Finished "doc".'

echo 'Starting "dot"...'
gulp dot
echo 'Finished "dot".'

echo 'Starting "icon".'
gulp icon
echo 'Finished "icon"...'
