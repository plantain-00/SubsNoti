/// <reference path="../typings/tsd.d.ts" />

import gulp = require('gulp');
const rename = require('gulp-rename');
const ejs = require("gulp-ejs");
const webpack = require('gulp-webpack');
const minifyHtml = require('gulp-minify-html');
const rev = require('gulp-rev-hash');
const less = require('gulp-less');
const path = require('path');
const minifyCSS = require('gulp-minify-css');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');

const minifyHtmlConfig = {
    conditionals: true,
    spare: true
};

gulp.task('pack-css', ['base.css']);

gulp.task('pack-js', ['index.js', 'login.js', 'newOrganization.js']);

gulp.task('pack-html', ['index', 'login', 'newOrganization']);

gulp.task('base.css', ()=> {
    uglifyCss("base");
});

gulp.task('index.js', ()=> {
    bundleAndUglifyJs("index");
});

gulp.task('index', ()=> {
    bundleAndUglifyHtml("index");
});

gulp.task('login.js', ()=> {
    bundleAndUglifyJs("login");
});

gulp.task('login', ()=> {
    bundleAndUglifyHtml("login");
});

gulp.task('newOrganization.js', ()=> {
    bundleAndUglifyJs("newOrganization");
});

gulp.task('newOrganization', ()=> {
    bundleAndUglifyHtml("newOrganization");
});

function uglifyCss(name:string) {
    gulp.src('./styles/' + name + '.less')
        .pipe(less())
        .pipe(postcss([autoprefixer({browsers: ['last 2 versions']})]))
        .pipe(minifyCSS())
        .pipe(rename(name + '.min.css'))
        .pipe(gulp.dest('./styles/'));
}

function bundleAndUglifyJs(name:string) {
    gulp.src('./scripts/' + name + '.js')
        .pipe(webpack({
            plugins: [
                new webpack.webpack.optimize.UglifyJsPlugin({minimize: true})
            ]
        }))
        .pipe(rename(name + '.min.js'))
        .pipe(gulp.dest('./scripts/'));
}

function bundleAndUglifyHtml(name:string) {
    gulp.src('./' + name + ".ejs")
        .pipe(ejs({}))
        .pipe(rev())
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename(name + '.html'))
        .pipe(gulp.dest("./"));
}