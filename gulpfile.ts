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
        gulp.src('./docs.js')
            .pipe(gulp.dest('./publish/'));
        gulp.src('./router.js')
            .pipe(gulp.dest('./publish/'));

        gulp.src('./enums/enums.js')
            .pipe(gulp.dest('./publish/enums/'));
        gulp.src('./interfaces/interfaces.js')
            .pipe(gulp.dest('./publish/interfaces/'));
        gulp.src('./models/*.js')
            .pipe(gulp.dest('./publish/models/'));
        gulp.src('./services/*.js')
            .pipe(gulp.dest('./publish/services/'));
        gulp.src('./controllers/*.js')
            .pipe(gulp.dest('./publish/controllers/'));

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