[![Dependency Status](https://david-dm.org/plantain-00/SubsNoti.svg)](https://david-dm.org/plantain-00/SubsNoti)
[![devDependency Status](https://david-dm.org/plantain-00/SubsNoti/dev-status.svg)](https://david-dm.org/plantain-00/SubsNoti#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/SubsNoti.svg?branch=master)](https://travis-ci.org/plantain-00/SubsNoti)

# tools and global npm packages

+ node.js >=4.0(for ES6 support)
+ typescript(for ES6 and ES7 async function support)
+ gulp
+ mongodb
+ redis
+ node-gyp build environment
+ node-canvas environment
+ pm2(host api and image uploader)
+ tsd

# development

+ `npm install`
+ `tsd install`
+ `gulp build`
+ `gulp host`
+ `gulp host-imageUploader`
+ `gulp host-imageServer`

# production

+ `gulp deploy`
+ `pm2 restart all`
