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
tsc -p frontends/
echo 'Finished "tsc".'

# test
echo 'Starting "test"...'
mocha tests/
echo 'Finished "test".'

# gulp task publish
echo 'Starting "generate document"...'
dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg
gitbook build doc/api/
echo 'Finished "generate document".'
echo 'Starting "generate css"...'
gulp css --gulpfile frontends/gulpfile.js
echo 'Finished "generate css".'
echo 'Starting "generate js"...'
gulp js --gulpfile frontends/gulpfile.js
echo 'Finished "generate js".'
echo 'Starting "rev"...'
gulp rev --gulpfile frontends/gulpfile.js
echo 'Finished "rev".'
echo 'Starting "generate html"...'
gulp html --gulpfile frontends/gulpfile.js
echo 'Finished "generate html".'
echo 'Starting "publish"...'
gulp publish
echo 'Finished "publish".'