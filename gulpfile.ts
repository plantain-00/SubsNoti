/// <reference path="./typings/tsd.d.ts" />

import * as gulp from 'gulp';
const del = require('del');

gulp.task('clean', () => {
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

gulp.task('publish', () => {
    gulp.src(['./app.js', './libs.js', './router.js', 'settings.js', './public/favicon.ico'])
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
    gulp.src("./public/doc/api/_book/**")
        .pipe(gulp.dest("./publish/public/doc/api/"));
});