[![Dependency Status](https://david-dm.org/plantain-00/SubsNoti.svg)](https://david-dm.org/plantain-00/SubsNoti)
[![devDependency Status](https://david-dm.org/plantain-00/SubsNoti/dev-status.svg)](https://david-dm.org/plantain-00/SubsNoti#info=devDependencies)

# tools and global npm packages

+ node.js >=4.0(for ES6 support)
+ typescript@next(for ES6 and ES7 async function support)
+ gulp
+ mocha
+ mongodb
+ redis
+ node-gyp build environment
+ node-canvas environment
+ pm2(host api and image uploader)

# development

+ `npm install`
+ `gulp build`
+ `gulp host`
+ `gulp host-imageUploader`
+ `gulp host-imageServer`

# production

+ `gulp deploy`
+ `pm2 restart all`

# demo

## api

http://115.29.42.125:9998/

## image uploader

http://115.29.42.125:9999/

## image server

http://115.29.42.125:7777/
