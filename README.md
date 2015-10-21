[![Circle CI](https://circleci.com/gh/plantain-00/SubsNoti/tree/master.svg?style=svg)](https://circleci.com/gh/plantain-00/SubsNoti/tree/master)
[![Dependency Status](https://david-dm.org/plantain-00/SubsNoti.svg)](https://david-dm.org/plantain-00/SubsNoti)
[![devDependency Status](https://david-dm.org/plantain-00/SubsNoti/dev-status.svg)](https://david-dm.org/plantain-00/SubsNoti#info=devDependencies)

# tools and global npm packages

+ git
+ node.js 4.x(for ES6 support)
+ tsd
+ typescript 1.7+(for ES6 and ES7 async function support)
+ gulp
+ mocha
+ mysql(optional)
+ mongodb
+ redis
+ gitbook-cli
+ graphviz
+ node-gyp build environment

## server only

+ forever

## development only

+ nodemon

# development

## make

+ `script/make.bat`

or

+ `script/make.sh`

then all is in `publish`.

## watch

+ `script/watch.bat`

or

+ `script/watch.sh`

# deploy

+ `git pull`
+ `scripts/make.sh`
+ `scripts/deploy.sh`

# tests

`mocha publish/backends/tests`

# demo

## development

http://115.29.42.125:8888/

## production

http://115.29.42.125/
