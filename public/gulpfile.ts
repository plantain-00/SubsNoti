/// <reference path="../typings/tsd.d.ts" />

import gulp = require('gulp');
const rename = require('gulp-rename');
const ejs = require("gulp-ejs");
const webpack = require('gulp-webpack');
const minifyHtml = require('gulp-minify-html');
const rev = require('gulp-rev-hash');

const minifyHtmlConfig = {
    conditionals: true,
    spare: true
};

gulp.task('pack-js', ['index.js', 'login.js', 'newOrganization.js']);

gulp.task('pack-html', ['index', 'login', 'newOrganization']);

gulp.task('index.js', ()=> {
    gulp.src('./scripts/index.js')
        .pipe(webpack({
            plugins: [
                new webpack.webpack.optimize.UglifyJsPlugin({minimize: true})
            ]
        }))
        .pipe(rename('index.min.js'))
        .pipe(gulp.dest('./scripts/'));
});

gulp.task('index', ()=> {
    gulp.src("./index.ejs")
        .pipe(ejs({}))
        .pipe(rev())
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename('index.html'))
        .pipe(gulp.dest("./"));
});

gulp.task('login.js', ()=> {
    gulp.src('./scripts/login.js')
        .pipe(webpack({
            plugins: [
                new webpack.webpack.optimize.UglifyJsPlugin({minimize: true})
            ]
        }))
        .pipe(rename('login.min.js'))
        .pipe(gulp.dest('./scripts/'));
});

gulp.task('login', ()=> {
    gulp.src("./login.ejs")
        .pipe(ejs({}))
        .pipe(rev())
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename('login.html'))
        .pipe(gulp.dest("./"));
});

gulp.task('newOrganization.js', ()=> {
    gulp.src('./scripts/newOrganization.js')
        .pipe(webpack({
            plugins: [
                new webpack.webpack.optimize.UglifyJsPlugin({minimize: true})
            ]
        }))
        .pipe(rename('newOrganization.min.js'))
        .pipe(gulp.dest('./scripts/'));
});

gulp.task('newOrganization', ()=> {
    gulp.src("./newOrganization.ejs")
        .pipe(ejs({}))
        .pipe(rev())
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename('newOrganization.html'))
        .pipe(gulp.dest("./"));
});
