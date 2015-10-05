/// <reference path="./typings/tsd.d.ts" />

import * as gulp from 'gulp';
let del = require('del');

gulp.task('clean', () => {
    del([
        'doc/api/_book/',
        'doc/api/*.svg',

        'frontends/build/',
        'frontends/**/*.css',
        'frontends/**/*.js',
        'frontends/**/*.html',

        'publish/public/',
        'publish/backends/',
        'publish/common/'
    ]);
});