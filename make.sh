#!/usr/bin/env bash

SRC_ROOT=/opt/src

# pull the source code
cd $SRC_ROOT
git pull

# install
npm --registry https://registry.npm.taobao.org install
tsd install

# compile gulpfile.ts
tsc -m commonjs gulpfile.ts

# gulp task clean
gulp clean

# compile
tsc -m commonjs *.ts
tsc -m commonjs ./public/scripts/*.ts
tsc -m commonjs ./public/*.ts

# test
mocha ./tests/

# gulp task publish
gulp document
cd ./public/
gulp pack-js
gulp pack-html
cd ..
gulp publish