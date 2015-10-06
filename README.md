[![Circle CI](https://circleci.com/gh/plantain-00/SubsNoti/tree/master.svg?style=svg)](https://circleci.com/gh/plantain-00/SubsNoti/tree/master)
[![Dependency Status](https://david-dm.org/plantain-00/SubsNoti.svg)](https://david-dm.org/plantain-00/SubsNoti)
[![devDependency Status](https://david-dm.org/plantain-00/SubsNoti/dev-status.svg)](https://david-dm.org/plantain-00/SubsNoti#info=devDependencies)

# tools and global npm packages

+ git
+ node.js 4.0.0+ && npm && n
+ tsd
+ typescript 1.6+
+ gulp
+ mocha
+ mysql || mariadb
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

+ script/make.bat

or

+ script/make.sh

then all is in `publish`.

## watch

+ script/watch.bat

# deploy

+ git pull
+ scripts/make.sh
+ scripts/deploy.sh

# tests

mocha publish/backends/tests