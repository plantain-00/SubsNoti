/// <reference path="./typings/tsd.d.ts" />

'use strict';

import * as gulp from 'gulp';
let del = require('del');
let rename = require('gulp-rename');
let ejs = require("gulp-ejs");
let webpack = require('webpack-stream');
let minifyHtml = require('gulp-minify-html');
let rev = require('gulp-rev');
let less = require('gulp-less');
let path = require('path');
let minifyCSS = require('gulp-minify-css');
let autoprefixer = require('autoprefixer');
let postcss = require('gulp-postcss');
let watch = require('gulp-watch');
let batch = require('gulp-batch');
let revReplace = require('gulp-rev-replace');
let shell = require('gulp-shell')

import * as environment from './common/environment';

gulp.task('clean', () => {
    del([
        'backends/**/*.js',

        'common/**/*.js',

        'frontends/doc/api/_book/',
        'frontends/build/',
        'frontends/scripts/*.js',

        'publish/public/',
        'publish/backends/',
        'publish/common/'
    ]);
});

let minifyHtmlConfig = {
    conditionals: true,
    spare: true
};

let isDevelopment = process.env.NODE_ENV !== environment.productionEnvironment;

gulp.task('watch', function() {
    watch('frontends/styles/*.less', batch(function(events, done) {
        gulp.start('css', done);
    }));
    watch("frontends/scripts/*.js", batch(function(events, done) {
        gulp.start('js', done);
    }));
    watch(["frontends/build/styles/*.css", "frontends/build/scripts/*.js"], batch(function(events, done) {
        gulp.start('rev', done);
    }));
    watch(['frontends/templates/*.ejs', "frontends/build/rev-manifest.json"], batch(function(events, done) {
        gulp.start('html', done);
    }));
    watch(['frontends/doc/api/*.md'], batch(function(events, done) {
        gulp.start('doc', done);
    }));
    watch(['frontends/doc/api/*.dot'], batch(function(events, done) {
        gulp.start('dot', done);
    }));
});

gulp.task('dot', shell.task([
    'dot -Tsvg frontends/doc/api/DatabaseModels.dot > publish/public/doc/api/DatabaseModels.svg'
]));

gulp.task('gitbook', shell.task('gitbook build frontends/doc/api'));

gulp.task('doc', ['gitbook'], () => {
    gulp.src("frontends/doc/api/_book/**")
        .pipe(gulp.dest("publish/public/doc/api/"));
});

gulp.task('icon', () => {
    gulp.src("frontends/favicon.ico")
        .pipe(gulp.dest("publish/public/"));
});

gulp.task('css', () => {
    for (let file of ["base"]) {
        uglifyCss(file);
    }
});

gulp.task('js', () => {
    for (let file of ['index', 'login', 'newOrganization']) {
        bundleAndUglifyJs(file);
    }
});

gulp.task('rev', () => {
    gulp.src(["frontends/build/styles/*.css", "frontends/build/scripts/*.js"], { base: 'frontends/build/' })
        .pipe(rev())
        .pipe(gulp.dest("publish/public/"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("frontends/build/"));
});

gulp.task('html', () => {
    for (let file of ['index', 'login', 'newOrganization']) {
        bundleAndUglifyHtml(file);
    }
});

function uglifyCss(name: string) {
    if (isDevelopment) {
        gulp.src('frontends/styles/' + name + '.less')
            .pipe(less())
            .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
            .pipe(rename(name + ".css"))
            .pipe(gulp.dest('frontends/build/styles/'));
    } else {
        gulp.src('frontends/styles/' + name + '.less')
            .pipe(less())
            .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
            .pipe(minifyCSS())
            .pipe(rename(name + ".min.css"))
            .pipe(gulp.dest('frontends/build/styles/'));
    }
}

function bundleAndUglifyJs(name: string) {
    if (isDevelopment) {
        gulp.src('frontends/scripts/' + name + '.js')
            .pipe(webpack())
            .pipe(rename(name + ".js"))
            .pipe(gulp.dest('frontends/build/scripts/'));
    } else {
        gulp.src('frontends/scripts/' + name + '.js')
            .pipe(webpack({
                plugins: [
                    new webpack.webpack.optimize.UglifyJsPlugin({ minimize: true })
                ]
            }))
            .pipe(rename(name + ".min.js"))
            .pipe(gulp.dest('frontends/build/scripts/'));
    }
}

function bundleAndUglifyHtml(name: string) {
    var manifest = gulp.src("frontends/build/rev-manifest.json");

    if (isDevelopment) {
        gulp.src('frontends/templates/' + name + '.ejs')
            .pipe(ejs({
                dotMin: isDevelopment ? '' : '.min'
            }))
            .pipe(rename(name + ".html"))
            .pipe(revReplace({
                manifest: manifest
            }))
            .pipe(gulp.dest("publish/public/"));
    } else {
        gulp.src('frontends/templates/' + name + '.ejs')
            .pipe(ejs({
                dotMin: isDevelopment ? '' : '.min'
            }))
            .pipe(minifyHtml(minifyHtmlConfig))
            .pipe(rename(name + ".html"))
            .pipe(revReplace({
                manifest: manifest
            }))
            .pipe(gulp.dest("publish/public/"));
    }
}
