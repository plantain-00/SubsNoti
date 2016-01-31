[![Dependency Status](https://david-dm.org/plantain-00/SubsNoti.svg)](https://david-dm.org/plantain-00/SubsNoti)
[![devDependency Status](https://david-dm.org/plantain-00/SubsNoti/dev-status.svg)](https://david-dm.org/plantain-00/SubsNoti#info=devDependencies)
[![Build Status](https://travis-ci.org/plantain-00/SubsNoti.svg?branch=master)](https://travis-ci.org/plantain-00/SubsNoti)

# tools and global npm packages

+ node.js >=4.0(for ES6 support)
+ typescript@next(for ES6 and ES7 async function support)
+ gulp
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

https://yorkyao.xyz/

## image server

https://img.yorkyao.xyz/

## image uploader

https://upload.yorkyao.xyz/

# secure

create a file of `secret.ts`, like:

```typescript
import * as types from "./share/types";
const settings = require("./settings");

export function load() {
    const db1 = {
        host: "",
        user: "",
        password: "",
        database: "",
    };
    settings.db.set("development", db1);
    settings.db.set("test", db1);
    settings.db.set("production", db1);

    const smtp1 = {
        host: "",
        auth: {
            user: "",
            pass: "",
        },
    };
    settings.smtp.set("development", smtp1);
    settings.smtp.set("test", smtp1);
    settings.smtp.set("production", smtp1);

    const redis1 = {
        host: "",
        port: 6379,
        options: {
            auth_pass: ""
        },
    };
    settings.redis.set("development", redis1);
    settings.redis.set("test", redis1);
    settings.redis.set("production", redis1);

    const mongodb1 = {
        url: "",
        options: {
            user: "",
            pass: "",
        },
    };
    const mongodb2 = {
        url: "",
        options: {
            user: "",
            pass: "",
        },
    };
    settings.mongodb.set("development", mongodb1);
    settings.mongodb.set("test", mongodb2);
    settings.mongodb.set("production", mongodb1);

    settings.login = {
        github: {
            clientId: "",
            clientSecret: "",
        },
    };
}
```
