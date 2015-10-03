#!/usr/bin/env bash

SRC_ROOT=

# pull the source code
cd $SRC_ROOT
echo 'Starting "git pull"...'
git pull
echo 'Finished "git pull".'

# install
echo 'Starting "npm install"...'
npm install
echo 'Finished "npm install".'
echo 'Starting "tsd install"...'
tsd install -ros
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
tsc
echo 'Finished "tsc".'

# test
echo 'Starting "test"...'
mocha ./tests/
echo 'Finished "test".'

# gulp task publish
echo 'Starting "generate document"...'
cd ./doc/api/
dot -Tsvg DatabaseModels.dot > DatabaseModels.svg
gitbook build
cd ../../
echo 'Finished "generate document".'
cd ./frontends/
echo 'Starting "generate css"...'
gulp css
echo 'Finished "generate css".'
echo 'Starting "generate js"...'
gulp js
echo 'Finished "generate js".'
echo 'Starting "rev"...'
gulp rev
echo 'Finished "rev".'
echo 'Starting "generate html"...'
gulp html
echo 'Finished "generate html".'
cd ..
echo 'Starting "publish"...'
gulp publish
echo 'Finished "publish".'