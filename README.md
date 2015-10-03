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
+ cd frontends/

```
gulp css
gulp js
gulp rev
gulp html
gulp doc
```

+ cd doc/api/

```
dot -Tsvg DatabaseModels.dot > DatabaseModels.svg
gitbook build
```

## watch

+ tsc --watch
+ nodemon --delay 0.5
+ cd frontends/

```
gulp watch
```
+ cd doc/api/

```
dot -Tsvg DatabaseModels.dot > DatabaseModels.svg
gitbook build
```

# deploy

+ scripts/make.sh
+ scripts/deploy.sh

# tests

mocha ./tests/