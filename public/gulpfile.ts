/// <reference path="../typings/tsd.d.ts" />

const gulp = require('gulp');
const rename = require('gulp-rename');
const ejs = require("gulp-ejs");
const webpack = require('gulp-webpack');
const minifyHtml = require('gulp-minify-html');

var minifyHtmlConfig = {
    conditionals: true,
    spare: true
};

gulp.task('index', function () {
    gulp.src("./index.ejs")
        .pipe(ejs({}))
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename('index.html'))
        .pipe(gulp.dest("./"));
});