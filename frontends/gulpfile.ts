/// <reference path="../typings/tsd.d.ts" />

import {config} from './settings';
import * as gulp from 'gulp';
const rename = require('gulp-rename');
const ejs = require("gulp-ejs");
const webpack = require('gulp-webpack');
const minifyHtml = require('gulp-minify-html');
const rev = require('gulp-rev');
const less = require('gulp-less');
const path = require('path');
const minifyCSS = require('gulp-minify-css');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const revReplace = require('gulp-rev-replace');

const minifyHtmlConfig = {
    conditionals: true,
    spare: true
};

const isDevelopment = config.environment == 'development';

gulp.task('watch', function() {
    watch('./styles/*.less', batch(function(events, done) {
        gulp.start('pack-css', done);
    }));
    watch("./scripts/*.js", batch(function(events, done) {
        gulp.start('pack-js', done);
    }));
    watch(["./build/styles/*.css", "./build/scripts/*.js"], batch(function(events, done) {
        gulp.start('rev', done);
    }));
    watch(['./*.ejs', "./build/rev-manifest.json"], batch(function(events, done) {
        gulp.start('pack-html', done);
    }));
    watch(['../doc/api/_book/*.html', "../doc/api/_book/*.svg"], batch(function(events, done) {
        gulp.start('pack-doc', done);
    }));
});

gulp.task('pack-doc', () => {
    gulp.src("../doc/api/_book/**")
        .pipe(gulp.dest("../public/doc/api/"));
});

gulp.task('pack-css', () => {
    for (let file of ["base"]) {
        uglifyCss(file);
    }
});

gulp.task('pack-js', () => {
    for (let file of ['index', 'login', 'newOrganization']) {
        bundleAndUglifyJs(file);
    }
});

gulp.task('rev', () => {
    gulp.src(["./build/styles/*.css", "./build/scripts/*.js"], { base: './build/' })
        .pipe(rev())
        .pipe(gulp.dest("../public/"))
        .pipe(rev.manifest())
        .pipe(gulp.dest("./build/"));
});

gulp.task('pack-html', () => {
    for (let file of ['index', 'login', 'newOrganization']) {
        bundleAndUglifyHtml(file);
    }
});

function uglifyCss(name: string) {
    if (isDevelopment) {
        gulp.src('./styles/' + name + '.less')
            .pipe(less())
            .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
            .pipe(rename(name + ".css"))
            .pipe(gulp.dest('./build/styles/'));
    } else {
        gulp.src('./styles/' + name + '.less')
            .pipe(less())
            .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
            .pipe(minifyCSS())
            .pipe(rename(name + ".min.css"))
            .pipe(gulp.dest('./build/styles/'));
    }
}

function bundleAndUglifyJs(name: string) {
    if (isDevelopment) {
        gulp.src('./scripts/' + name + '.js')
            .pipe(webpack())
            .pipe(rename(name + ".js"))
            .pipe(gulp.dest('./build/scripts/'));
    } else {
        gulp.src('./scripts/' + name + '.js')
            .pipe(webpack({
                plugins: [
                    new webpack.webpack.optimize.UglifyJsPlugin({ minimize: true })
                ]
            }))
            .pipe(rename(name + ".min.js"))
            .pipe(gulp.dest('./build/scripts/'));
    }
}

function bundleAndUglifyHtml(name: string) {
    var manifest = gulp.src("./build/rev-manifest.json");

    if (isDevelopment) {
        gulp.src('./' + name + '.ejs')
            .pipe(ejs({
                dotMin: isDevelopment ? '' : '.min'
            }))
            .pipe(rename(name + ".html"))
            .pipe(revReplace({
                manifest: manifest
            }))
            .pipe(gulp.dest("../public/"));
    } else {
        gulp.src('./' + name + '.ejs')
            .pipe(ejs({
                dotMin: isDevelopment ? '' : '.min'
            }))
            .pipe(minifyHtml(minifyHtmlConfig))
            .pipe(rename(name + ".html"))
            .pipe(revReplace({
                manifest: manifest
            }))
            .pipe(gulp.dest("../public/"));
    }
}