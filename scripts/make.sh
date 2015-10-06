#!/usr/bin/env bash

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
tsc -p frontends
tsc -p backends
echo 'Finished "tsc".'

# test
echo 'Starting "test"...'
mocha publish/backends/tests
echo 'Finished "test".'

# gulp tasks
echo 'Starting "css"...'
NODE_ENV=production gulp css
echo 'Finished "css".'

echo 'Starting "js"...'
NODE_ENV=production gulp js
echo 'Finished "js".'

echo 'Starting "rev"...'
NODE_ENV=production gulp rev
echo 'Finished "rev".'

echo 'Starting "html"...'
NODE_ENV=production gulp html
echo 'Finished "html".'

echo 'Starting "doc"...'
NODE_ENV=production gulp doc
echo 'Finished "doc".'

echo 'Starting "dot"...'
NODE_ENV=production gulp dot
echo 'Finished "dot".'

echo 'Starting "icon".'
NODE_ENV=production gulp icon
echo 'Finished "icon"...'