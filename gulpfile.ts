/// <reference path="./typings/tsd.d.ts" />

import gulp = require('gulp');
const del = require('del');

import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

gulp.task('clean', ()=> {
    del(['./*.js',
        './controllers/*.js',
        './demos/*.js',
        './enums/*.js',
        './interfaces/*.js',
        './services/*.js',
        './tests/*.js',
        './public/**/*.html',
        './public/**/*.css',
        './public/**/*.js',
        './publish/*']);
});

gulp.task('publish', ()=> {
    gulp.src('./app.js')
        .pipe(gulp.dest('./publish/'));
    gulp.src('./libs.js')
        .pipe(gulp.dest('./publish/'));
    gulp.src('./docs.js')
        .pipe(gulp.dest('./publish/'));
    gulp.src('./router.js')
        .pipe(gulp.dest('./publish/'));

    gulp.src('./enums/enums.js')
        .pipe(gulp.dest('./publish/enums/'));
    gulp.src('./interfaces/interfaces.js')
        .pipe(gulp.dest('./publish/interfaces/'));
    gulp.src('./services/*.js')
        .pipe(gulp.dest('./publish/services/'));
    gulp.src('./controllers/*.js')
        .pipe(gulp.dest('./publish/controllers/'));

    gulp.src("./public/*.html")
        .pipe(gulp.dest("./publish/public/"));
    gulp.src("./public/scripts/*.min.js")
        .pipe(gulp.dest("./publish/public/scripts/"));
    gulp.src("./public/styles/*.min.css")
        .pipe(gulp.dest("./publish/public/styles/"));
    gulp.src("./public/doc/api/*.html")
        .pipe(gulp.dest("./publish/public/doc/api"));
    gulp.src('./public/favicon.ico')
        .pipe(gulp.dest('./publish/'));
});