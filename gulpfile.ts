/// <reference path="./typings/tsd.d.ts" />

import gulp = require('gulp');
const rename = require('gulp-rename');
const ejs = require("gulp-ejs");
const webpack = require('gulp-webpack');
const minifyHtml = require('gulp-minify-html');
const del = require('del');

import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");
import models = require("./models/models");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

import docs = require("./docs");

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
        gulp.src("./public/doc/api/*.html")
            .pipe(gulp.dest("publish/public/doc/api"));
    });
});

gulp.task('index', function () {
    gulp.src("./public/index.ejs")
        .pipe(ejs({}))
        .pipe(minifyHtml(minifyHtmlConfig))
        .pipe(rename('index.html'))
        .pipe(gulp.dest("./public/"));
});

gulp.task("document", function () {
    del(["./public/doc/api/*"], function () {
        const documentsHome = {
            name: "API document",
            apis: []
        };

        libs._.each(docs.allDocuments, (api:interfaces.ApiDocument)=> {
            api.documentUrl = "/doc/api/" + libs.md5(api.name) + ".html";
            documentsHome.apis.push("<a href='" + api.documentUrl + "'>" + api.name + "</a> -  <a href='" + api.url + "'>" + api.url + "</a> - " + api.method);

            var document = JSON.parse(JSON.stringify(api));

            document.url = "<a href='" + api.url + "'>" + api.url + "</a>";

            var data = "<style>*{font-family: 'Courier New'}</style><title>" + document.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(document, null, 4) + "</pre>";

            libs.fs.writeFile(libs.path.join(__dirname, 'public') + document.documentUrl, data, error=> {
                if (error) {
                    console.log(error);
                }
            });
        });

        libs.fs.writeFile(libs.path.join(__dirname, 'public') + "/doc/api/index.html", "<style>*{font-family: 'Courier New'}a:link{color:black;text-decoration: none}a:visited {color:black;text-decoration: none}a:hover {color:black;text-decoration: none}a:active {color:black;text-decoration: none}</style><title>" + documentsHome.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(documentsHome, null, 4) + "</pre>", error=> {
            if (error) {
                console.log(error);
            }
        });
    });
});

gulp.task("default", ["document", "publish", "index"]);