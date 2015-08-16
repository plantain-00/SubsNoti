/// <reference path="./typings/tsd.d.ts" />

const gulp = require('gulp');
const rename = require('gulp-rename');
const ejs = require("gulp-ejs");
const webpack = require('gulp-webpack');
const minifyHtml = require('gulp-minify-html');
const del = require('del');

var minifyHtmlConfig = {
    conditionals: true,
    spare: true
};

gulp.task('publish', function () {
    del([
        './publish/*'
    ], function () {
        gulp.src('./app.js')
            .pipe(gulp.dest('./publish/'));
        gulp.src('./libs.js')
            .pipe(gulp.dest('./publish/'));

        gulp.src("./public/*.html")
            .pipe(gulp.dest("publish/public/"));
    });
});

gulp.task('index', function () {
    gulp.src("./public/index.ejs")
        .pipe(ejs({}))
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename('index.html'))
        .pipe(gulp.dest("./public/"));
});