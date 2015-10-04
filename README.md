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

## init

+ npm install
+ tsd install -ros
+ gulp css --gulpfile frontends/gulpfile.js
+ gulp js --gulpfile frontends/gulpfile.js
+ gulp rev --gulpfile frontends/gulpfile.js
+ gulp html --gulpfile frontends/gulpfile.js
+ dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg
+ gitbook build doc/api/
+ gulp doc --gulpfile frontends/gulpfile.js

## watch

+ tsc --watch
+ nodemon --delay 0.5
+ gulp watch --gulpfile frontends/gulpfile.js
+ dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg
+ gitbook build doc/api/

# deploy

+ scripts/make.sh
+ scripts/deploy.sh

# tests

mocha tests/