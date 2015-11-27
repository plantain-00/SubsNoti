[![Dependency Status](https://david-dm.org/plantain-00/SubsNoti.svg)](https://david-dm.org/plantain-00/SubsNoti)
[![devDependency Status](https://david-dm.org/plantain-00/SubsNoti/dev-status.svg)](https://david-dm.org/plantain-00/SubsNoti#info=devDependencies)

# tools and global npm packages

+ git
+ node.js >=4.0(for ES6 support)
+ tsd
+ typescript@next(for ES6 and ES7 async function support)
+ gulp
+ mocha
+ mysql(optional)
+ mongodb
+ redis
+ gitbook-cli
+ graphviz
+ node-gyp build environment
+ node-canvas environment
+ scss-lint
+ pm2(for server)

# development

+ `npm install`
+ `tsc`: compile `gulpfile.ts` to `gulpfile.js`
+ `gulp make`: compile, bundle and so on
  - `gulp back`: build backend things
    + `tsc -p backends --pretty`: build the typescript files for backends
  - `gulp front`: build frontend things
    + `tsc -p frontends --pretty`: build the typescript files for frontends
    + `gulp css`: build scss files, then publish the generated css files
    + `gulp js`: publish and pack js files
    + `gulp rev`: collect the versions of js and css files
    + `gulp html`: build `ejs` files, bundle the generated html files
  - `mocha publish/backends/tests`: run tests for backends
  - `gulp package`: publish `package.json`
  - `gulp tslint`: run tslint for all `ts` files
  - `gulp scss-lint`: run scss-lint for all `scss` files
  - `gulp doc`: build documents, then publish it
    + `gulp gitbook`: build documents with gitbook
  - `gulp dot`: generate images from `dot` files
  - `gulp icon`: publish icons
+ `gulp run`: run the website. should
+ `gulp clean`: clean generated files

# production

+ `scripts/make.sh`
+ `scripts/deploy.sh`

# demo

## development

http://115.29.42.125:8888/

## production

http://115.29.42.125/

## document

http://115.29.42.125:9997/
