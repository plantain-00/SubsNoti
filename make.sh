#!/usr/bin/env bash

SRC_ROOT=/opt/src

# pull the source code
cd $SRC_ROOT
echo 'Starting "git pull"...'
git pull
echo 'Finished "git pull".'

# install
echo 'Starting "npm install"...'
npm --registry https://registry.npm.taobao.org install
echo 'Finished "npm install".'
echo 'Starting "tsd install"...'
tsd install
echo 'Finished "tsd install".'

# compile gulpfile.ts
echo 'Starting "tsc gulpfile.ts"...'
tsc -m commonjs gulpfile.ts
echo 'Finished "tsc gulpfile.ts".'

# gulp task clean
echo 'Starting "gulp clean"...'
gulp clean
echo 'Finished "gulp clean".'

# compile
echo 'Starting "tsc"...'
tsc -m commonjs *.ts
tsc -m commonjs ./public/scripts/*.ts
tsc -m commonjs ./public/*.ts
tsc -m commonjs ./tests/*.ts
echo 'Finished "tsc".'

# test
echo 'Starting "test"...'
mocha ./tests/
echo 'Finished "test".'

# gulp task publish
echo 'Starting "generate document"...'
gulp document
echo 'Finished "generate document".'
cd ./public/
echo 'Starting "generate js"...'
gulp pack-js
echo 'Finished "generate js".'
echo 'Starting "generate html"...'
gulp pack-html
echo 'Finished "generate html".'
cd ..
echo 'Starting "publish"...'
gulp publish
echo 'Finished "publish".'