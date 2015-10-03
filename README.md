[![Circle CI](https://circleci.com/gh/plantain-00/SubsNoti/tree/master.svg?style=svg)](https://circleci.com/gh/plantain-00/SubsNoti/tree/master)

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
+ gulp doc --gulpfile frontends/gulpfile.js
+ gitbook build doc/api/
+ dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg

## watch

+ tsc --watch
+ nodemon --delay 0.5
+ gulp watch --gulpfile frontends/gulpfile.js
+ gitbook build doc/api/
+ dot -Tsvg doc/api/DatabaseModels.dot > doc/api/DatabaseModels.svg

# deploy

+ scripts/make.sh
+ scripts/deploy.sh

# tests

mocha tests/