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
tsc
echo 'Finished "tsc gulpfile.ts".'

# gulp task clean
echo 'Starting "gulp clean"...'
gulp clean
echo 'Finished "gulp clean".'

# compile
echo 'Starting "tsc"...'
tsc
tsc -p frontends
tsc -p backends
echo 'Finished "tsc".'

# test
echo 'Starting "test"...'
mocha publish/backends/tests
echo 'Finished "test".'

# gulp task publish
echo 'Starting "publish document"...'
dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg
gitbook build doc/api/
gulp doc --gulpfile frontends/gulpfile.js
echo 'Finished "publish document".'

echo 'Starting "publish icon".'
gulp icon --gulpfile frontends/gulpfile.js
echo 'Finished "publish icon"...'

echo 'Starting "publish css"...'
gulp css --gulpfile frontends/gulpfile.js
echo 'Finished "publish css".'

echo 'Starting "publish js"...'
gulp js --gulpfile frontends/gulpfile.js
echo 'Finished "publish js".'

echo 'Starting "rev"...'
gulp rev --gulpfile frontends/gulpfile.js
echo 'Finished "rev".'

echo 'Starting "publish html"...'
gulp html --gulpfile frontends/gulpfile.js
echo 'Finished "publish html".'