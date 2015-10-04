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
+ tsc
+ gulp css --gulpfile frontends/gulpfile.js
+ gulp js --gulpfile frontends/gulpfile.js
+ gulp rev --gulpfile frontends/gulpfile.js
+ gulp html --gulpfile frontends/gulpfile.js
+ dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg
+ gitbook build doc/api/
+ gulp doc --gulpfile frontends/gulpfile.js

## watch

### frontend

+ tsc -w
+ gulp watch

### backend

+ tsc -w
+ nodemon --delay 0.5 publish/backends/app.js

### doc

+ dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg
+ gitbook build doc/api/

# deploy

+ scripts/make.sh
+ scripts/deploy.sh

# tests

mocha publish/backends/tests